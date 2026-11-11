import { useEffect, useRef } from 'react';

type MovingImage = {
  frame: HTMLElement;
  image: HTMLImageElement;
  top: number;
  height: number;
  tiltX: number;
  tiltY: number;
  targetX: number;
  targetY: number;
};

type Magnet = { element: HTMLElement; x: number; y: number; targetX: number; targetY: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const ease = (elapsed: number, time: number) => 1 - Math.exp(-elapsed / time);

export default function MotionScene({ paused }: { paused: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = ref.current;
    if (!field) return;
    const wash = field.querySelector<HTMLElement>('.field__wash');
    const mesh = field.querySelector<SVGSVGElement>('.field__mesh');
    const ray = field.querySelector<HTMLElement>('.field__ray');
    const hero = document.querySelector<HTMLElement>('.hero');
    if (!wash || !mesh || !ray) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const precise = matchMedia('(hover: hover) and (pointer: fine)');
    let hidden = document.hidden;
    let frame = 0;
    let lastFrame = 0;
    let scrollTarget = scrollY;
    let scrollCurrent = scrollY;
    let pageLength = 1;
    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let pointerX = 0;
    let pointerY = 0;
    let measuredHero = { left: 0, top: 0, width: 1, height: 1 };
    let disposed = false;
    const animations: Animation[] = [];
    const images: MovingImage[] = [...document.querySelectorAll<HTMLElement>('.project-visual')]
      .flatMap(frame => {
        const image = frame.querySelector<HTMLImageElement>('img');
        return image ? [{ frame, image, top: 0, height: 1, tiltX: 0, tiltY: 0, targetX: 0, targetY: 0 }] : [];
      });
    const magnets: Magnet[] = [...document.querySelectorAll<HTMLElement>('.magnet-core')]
      .map(element => ({ element, x: 0, y: 0, targetX: 0, targetY: 0 }));
    const cleanup: (() => void)[] = [];
    let observer: IntersectionObserver | undefined;

    const canMove = () => !paused && !hidden && !reduced.matches;
    const canPoint = () => canMove() && precise.matches;
    const measure = () => {
      if (disposed) return;
      pageLength = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
      if (hero) {
        const box = hero.getBoundingClientRect();
        measuredHero = { left: box.left, top: box.top + scrollY, width: box.width, height: box.height };
      }
      images.forEach(item => {
        const box = item.frame.getBoundingClientRect();
        item.top = box.top + scrollY;
        item.height = box.height;
      });
      scrollTarget = scrollY;
    };

    const staticState = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      field.classList.add('is-still');
      document.documentElement.dataset.motion = 'off';
      animations.forEach(animation => animation.finish());
      magnets.forEach(item => { item.element.style.transform = ''; item.x = item.y = item.targetX = item.targetY = 0; });
      images.forEach(item => {
        item.frame.style.transform = '';
        item.image.style.transform = '';
        item.tiltX = item.tiltY = item.targetX = item.targetY = 0;
      });
    };

    const tick = (time: number) => {
      frame = 0;
      if (!canMove()) { staticState(); return; }
      const elapsed = clamp(lastFrame ? time - lastFrame : 16, 1, 64);
      lastFrame = time;
      scrollCurrent += (scrollTarget - scrollCurrent) * ease(elapsed, 115);
      pointerX += (pointerTargetX - pointerX) * ease(elapsed, 190);
      pointerY += (pointerTargetY - pointerY) * ease(elapsed, 190);
      const progress = clamp(scrollCurrent / pageLength, 0, 1);
      // Give the first viewport its own travel; page progress alone moves only a
      // few pixels before PeladaPro on a long page.
      const openingDepth = clamp(scrollCurrent / (innerHeight * 1.4), 0, 1);
      const ambient = Math.sin(time / 3200) * 7;
      const sweep = Math.sin(progress * Math.PI);
      const reading = clamp((progress - .18) / .4, 0, 1);
      const closing = clamp((progress - .76) / .24, 0, 1);

      wash.style.transform = `translate3d(${(-90 + openingDepth * 40 + progress * 90 + pointerX * 22).toFixed(2)}px,${(-90 + openingDepth * 20 + progress * 60 + pointerY * 16 + ambient).toFixed(2)}px,0) scale(${(1 + progress * .13).toFixed(3)})`;
      wash.style.opacity = String((.8 - reading * .35 + closing * .2).toFixed(3));
      mesh.style.transform = `translate3d(${(-80 + openingDepth * 160 + progress * 75 + pointerX * 11).toFixed(2)}px,${(30 - openingDepth * 130 - progress * 65 + ambient * .45).toFixed(2)}px,0) rotate(${(-8 + progress * 17).toFixed(2)}deg) scale(${(1 + progress * .17).toFixed(3)})`;
      mesh.style.opacity = String((.7 - reading * .35 + closing * .14).toFixed(3));
      if (innerWidth > 640) {
        ray.style.transform = `translate3d(${(110 - openingDepth * 100 - progress * 125 - pointerX * 14).toFixed(2)}px,${(-40 + openingDepth * 90 + progress * 125 - pointerY * 10 - ambient * .5).toFixed(2)}px,0) rotate(${(28 - progress * 25).toFixed(2)}deg) scale(${(1 + sweep * .12).toFixed(3)})`;
        ray.style.opacity = String((.48 - reading * .28 + closing * .24).toFixed(3));
      }
      field.style.setProperty('--motion-progress', progress.toFixed(4));

      const imageEase = ease(elapsed, 155);
      images.forEach(item => {
        const center = item.top + item.height / 2;
        const viewCenter = scrollCurrent + innerHeight / 2;
        if (Math.abs(viewCenter - center) > (innerHeight + item.height) * .8) return;
        const distance = clamp((viewCenter - center) / ((innerHeight + item.height) / 2), -1, 1);
        const travel = precise.matches && innerWidth > 640 ? Math.min(item.height * .03, 24) : Math.min(item.height * .012, 8);
        item.tiltX += (item.targetX - item.tiltX) * imageEase;
        item.tiltY += (item.targetY - item.tiltY) * imageEase;
        item.image.style.transform = `translate3d(0,${(distance * travel).toFixed(2)}px,0) scale(1.075)`;
        if (precise.matches) item.frame.style.transform = `perspective(1200px) rotateX(${item.tiltY.toFixed(2)}deg) rotateY(${item.tiltX.toFixed(2)}deg)`;
      });
      const magnetEase = ease(elapsed, 140);
      magnets.forEach(item => {
        item.x += (item.targetX - item.x) * magnetEase;
        item.y += (item.targetY - item.y) * magnetEase;
        item.element.style.transform = `translate3d(${item.x.toFixed(2)}px,${item.y.toFixed(2)}px,0)`;
      });
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (canMove()) {
        field.classList.remove('is-still');
        document.documentElement.dataset.motion = 'on';
        lastFrame = 0;
        scrollTarget = scrollY;
        if (!frame) frame = requestAnimationFrame(tick);
      } else staticState();
    };
    const onScroll = () => { scrollTarget = scrollY; };
    const onVisibility = () => { hidden = document.hidden; start(); };
    const onMedia = () => { pointerTargetX = pointerTargetY = 0; start(); };
    const onResize = () => { measure(); start(); };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    reduced.addEventListener('change', onMedia);
    precise.addEventListener('change', onMedia);
    cleanup.push(() => removeEventListener('scroll', onScroll), () => removeEventListener('resize', onResize),
      () => document.removeEventListener('visibilitychange', onVisibility),
      () => reduced.removeEventListener('change', onMedia), () => precise.removeEventListener('change', onMedia));

    if (hero) {
      const move = (event: PointerEvent) => {
        if (!canPoint()) return;
        pointerTargetX = clamp(((event.clientX - measuredHero.left) / measuredHero.width - .5) * 2, -1, 1);
        pointerTargetY = clamp(((event.clientY + scrollY - measuredHero.top) / measuredHero.height - .5) * 2, -1, 1);
      };
      const leave = () => { pointerTargetX = pointerTargetY = 0; };
      hero.addEventListener('pointermove', move);
      hero.addEventListener('pointerleave', leave);
      cleanup.push(() => hero.removeEventListener('pointermove', move), () => hero.removeEventListener('pointerleave', leave));
    }
    magnets.forEach(item => {
      const parent = item.element.parentElement;
      if (!parent) return;
      let box: DOMRect;
      const enter = () => { box = parent.getBoundingClientRect(); };
      const move = (event: PointerEvent) => {
        if (!canPoint()) return;
        if (!box) box = parent.getBoundingClientRect();
        item.targetX = clamp((event.clientX - box.left - box.width / 2) * .12, -7, 7);
        item.targetY = clamp((event.clientY - box.top - box.height / 2) * .12, -7, 7);
      };
      const leave = () => { item.targetX = item.targetY = 0; };
      parent.addEventListener('pointerenter', enter);
      parent.addEventListener('pointermove', move);
      parent.addEventListener('pointerleave', leave);
      cleanup.push(() => parent.removeEventListener('pointerenter', enter), () => parent.removeEventListener('pointermove', move), () => parent.removeEventListener('pointerleave', leave));
    });
    images.forEach(item => {
      const parent = item.frame.closest<HTMLElement>('.visual-link');
      if (!parent) return;
      let box: DOMRect;
      const enter = () => { box = parent.getBoundingClientRect(); };
      const move = (event: PointerEvent) => {
        if (!canPoint()) return;
        if (!box) box = parent.getBoundingClientRect();
        item.targetX = clamp(((event.clientX - box.left) / box.width - .5) * 1.6, -.8, .8);
        item.targetY = clamp(-((event.clientY - box.top) / box.height - .5) * 1.6, -.8, .8);
      };
      const leave = () => { item.targetX = item.targetY = 0; };
      parent.addEventListener('pointerenter', enter);
      parent.addEventListener('pointermove', move);
      parent.addEventListener('pointerleave', leave);
      cleanup.push(() => parent.removeEventListener('pointerenter', enter), () => parent.removeEventListener('pointermove', move), () => parent.removeEventListener('pointerleave', leave));
    });

    if (!paused && !reduced.matches) {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          observer?.unobserve(entry.target);
          if (!canMove()) return;
          const element = entry.target as HTMLElement;
          const index = Number(element.dataset.motionIndex || 0);
          animations.push(element.animate([
            { opacity: .78, transform: `translate3d(${index % 2 ? 13 : -13}px,18px,0)` },
            { opacity: 1, transform: 'translate3d(0,0,0)' }
          ], { duration: index === 0 ? 500 : 440, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'none' }));
        });
      }, { threshold: .13 });
      document.querySelectorAll('.project-row, .featured-intro').forEach((element, index) => {
        (element as HTMLElement).dataset.motionIndex = String(index);
        observer?.observe(element);
      });
    }
    measure();
    document.fonts.ready.then(measure).catch(() => {});
    start();
    let introTimer = 0;
    if (hero && !document.documentElement.dataset.intro) {
      introTimer = window.setTimeout(() => { document.documentElement.dataset.intro = 'done'; }, 850);
    }
    return () => {
      disposed = true;
      observer?.disconnect();
      cleanup.forEach(remove => remove());
      clearTimeout(introTimer);
      document.documentElement.dataset.intro = 'done';
      staticState();
      delete document.documentElement.dataset.motion;
    };
  }, [paused]);

  return <div ref={ref} className={`field${paused ? ' is-still' : ''}`} aria-hidden="true">
    <div className="field__wash" />
    <svg className="field__mesh" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.1">
        <path d="M-260 790 C105 255 480 735 785 402 C1050 122 1350 500 1680 82" />
        <path d="M-260 840 C120 317 500 793 808 456 C1072 180 1368 560 1690 139" />
        <path d="M-260 892 C139 381 521 851 831 511 C1094 238 1386 620 1700 196" />
        <path d="M-260 946 C158 445 542 909 854 566 C1116 296 1404 680 1710 253" />
        <path d="M-260 1002 C177 509 563 967 877 621 C1138 354 1422 740 1720 310" />
      </g>
    </svg>
    <div className="field__ray" />
  </div>;
}
