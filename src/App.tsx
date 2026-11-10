import { useEffect, useRef, useState } from 'react';
import { content, type Language, type Project } from './content';

const getLanguage = (): Language => location.pathname.startsWith('/en') ? 'en' : 'pt';
const external = { target: '_blank', rel: 'noopener noreferrer' } as const;

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={diagonal ? 'M5 19 19 5M7 5h12v12' : 'M4 12h16m-6-6 6 6-6 6'} /></svg>;
}

function Field({ paused }: { paused: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame = 0;
    let visible = !document.hidden;
    let inView = true;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      frame = 0;
      if (!element || paused || !visible || !inView || reduced.matches) return;
      const progress = Math.min(window.scrollY / Math.max(window.innerHeight * 2, 1), 1);
      element.style.setProperty('--field-shift', `${Math.round(progress * -90)}px`);
      element.style.setProperty('--field-opacity', `${Math.max(.16, .62 - progress * .46)}`);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    const syncPause = () => element.classList.toggle('is-still', paused || !visible || !inView);
    const onVisibility = () => { visible = !document.hidden; syncPause(); if (visible) update(); };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncPause(); if (inView) update(); }, { rootMargin: '100px' });
    observer.observe(element);
    update();
    addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    reduced.addEventListener('change', update);
    return () => { observer.disconnect(); removeEventListener('scroll', onScroll); document.removeEventListener('visibilitychange', onVisibility); reduced.removeEventListener('change', update); if (frame) cancelAnimationFrame(frame); };
  }, [paused]);
  return <div ref={ref} className={`field ${paused ? 'is-still' : ''}`} aria-hidden="true"><div className="field__halo" /><div className="field__lines" /></div>;
}

function ProjectVisual({ project, featured = false, lang }: { project: Project; featured?: boolean; lang: Language }) {
  return <div className={`project-visual project-visual--${project.id} ${featured ? 'project-visual--featured' : ''}`}>
    <picture><source media="(max-width: 640px)" srcSet={`/projects/${project.id}-mobile.jpg`} /><img src={`/projects/${project.id}.jpg`} width="1440" height="900" loading={featured ? 'eager' : 'lazy'} decoding="async" alt={lang === 'pt' ? `Captura real da página inicial de ${project.name}` : `Real screenshot of the ${project.name} homepage`} /></picture>
  </div>;
}

function ProjectLinks({ project, live, code }: { project: Project; live: string; code: string }) {
  return <div className="project-links"><a href={project.live} {...external}>{live}<Arrow diagonal /></a>{project.code && <a href={project.code} {...external}>{code}<Arrow diagonal /></a>}</div>;
}

export default function App() {
  const [lang, setLang] = useState<Language>(getLanguage);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paused, setPaused] = useState(() => localStorage.getItem('ambient-paused') === 'true');
  const t = content[lang];

  useEffect(() => {
    if (location.pathname === '/' || !/^\/(pt|en)\/?$/.test(location.pathname)) history.replaceState({}, '', `/${lang}${location.hash}`);
    const onPop = () => { setLang(getLanguage()); setMenuOpen(false); };
    addEventListener('popstate', onPop);
    return () => removeEventListener('popstate', onPop);
  }, [lang]);

  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    document.title = t.metaTitle;
    const description = document.querySelector('meta[name="description"]') ?? document.head.appendChild(document.createElement('meta'));
    description.setAttribute('name', 'description'); description.setAttribute('content', t.metaDescription);
    const og = document.querySelector('meta[property="og:title"]') ?? document.head.appendChild(document.createElement('meta'));
    og.setAttribute('property', 'og:title'); og.setAttribute('content', t.metaTitle);
    const ogDesc = document.querySelector('meta[property="og:description"]') ?? document.head.appendChild(document.createElement('meta'));
    ogDesc.setAttribute('property', 'og:description'); ogDesc.setAttribute('content', t.metaDescription);
  }, [lang, t]);

  const changeLanguage = (next: Language) => {
    if (next === lang) return;
    history.pushState({}, '', `/${next}${location.hash}`);
    setLang(next); setMenuOpen(false);
  };
  const togglePaused = () => setPaused(value => { localStorage.setItem('ambient-paused', String(!value)); return !value; });
  const closeMenu = () => setMenuOpen(false);
  const featured = t.projects[0];

  return <>
    <Field paused={paused} />
    <a className="skip-link" href="#main">{lang === 'pt' ? 'Ir para o conteúdo' : 'Skip to content'}</a>
    <header className="site-header">
      <a className="wordmark" href={`/${lang}#top`} onClick={closeMenu} aria-label="Gabriel Carvalho — início">GC<span className="wordmark__dot">.</span></a>
      <button className="menu-button" type="button" aria-label={menuOpen ? t.nav.close : t.nav.menu} aria-expanded={menuOpen} aria-controls="site-nav" onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
      <nav id="site-nav" className={menuOpen ? 'nav nav--open' : 'nav'} aria-label={lang === 'pt' ? 'Navegação principal' : 'Main navigation'}>
        <a href="#projects" onClick={closeMenu}>{t.nav.projects}</a><a href="#about" onClick={closeMenu}>{t.nav.about}</a><a href="#contact" onClick={closeMenu}>{t.nav.contact}</a>
        <div className="lang-switch" aria-label={lang === 'pt' ? 'Idioma' : 'Language'}><button type="button" aria-current={lang === 'pt' ? 'page' : undefined} onClick={() => changeLanguage('pt')}>PT</button><span>/</span><button type="button" aria-current={lang === 'en' ? 'page' : undefined} onClick={() => changeLanguage('en')}>EN</button></div>
      </nav>
    </header>

    <main id="main">
      <section className="hero container" id="top" aria-labelledby="hero-title">
        <div className="hero__top"><p>{t.hero.lead}</p><span>{t.portfolio}</span></div>
        <h1 id="hero-title"><span>Gabriel</span><span>Carvalho<span className="hero__period">.</span></span></h1>
        <div className="hero__bottom"><p>{t.hero.line}</p><a className="round-action" href="#projects"><span>{t.hero.action}</span><span className="round-action__icon"><Arrow /></span></a></div>
        <div className="hero__foot"><span>{t.hero.scroll}</span><button type="button" className="motion-control" onClick={togglePaused} aria-pressed={paused}>{paused ? t.labels.play : t.labels.pause}<span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span></button></div>
      </section>

      <section className="featured-section container" id="projects" aria-labelledby="featured-title">
        <div className="section-heading"><h2 id="featured-title">{t.labels.selected}</h2></div>
        <div className="featured-intro"><div><h3>{featured.name}</h3></div><p>{t.featured.title}</p></div>
        <a href={featured.live} {...external} className="visual-link" aria-label={`${t.labels.live}: ${featured.name}`}><ProjectVisual project={featured} featured lang={lang} /></a>
        <div className="featured-detail"><p>{t.featured.body}</p><div><span>{t.labels.process}</span><p>{t.featured.process}</p><ProjectLinks project={featured} live={t.labels.live} code={t.labels.code} /></div></div>
      </section>

      <section className="more-section container" aria-labelledby="more-title"><div className="section-heading"><h2 id="more-title">{t.labels.more}</h2></div>
        <div className="project-list">{t.projects.slice(1).map((project, index) => <article className={`project-row project-row--${index}`} key={project.id}>
          <div className="project-row__copy"><span>{project.category}</span><h3>{project.name}</h3><p>{project.details}</p><ProjectLinks project={project} live={t.labels.live} code={t.labels.code} /></div>
          <a href={project.live} {...external} className="visual-link" aria-label={`${t.labels.live}: ${project.name}`}><ProjectVisual project={project} lang={lang} /></a>
        </article>)}</div>
      </section>

      <section className="about-section" id="about" aria-labelledby="about-title"><div className="container about-grid"><h2 id="about-title">{t.about.title}<span className="acid-dot">.</span></h2><div><p className="about-lead">{t.about.first}</p><p>{t.about.second}</p><div className="about-tags"><span>UNINASSAU</span><span>{t.englishLevel}</span><span>VANCOUVER</span></div></div></div></section>
      <section className="contact-section container" id="contact" aria-labelledby="contact-title"><p>{t.contact.body}</p><h2 id="contact-title">{t.contact.title}</h2><div className="contact-links"><a href="https://www.linkedin.com/in/gabrielcarvalhours" {...external}>{t.contact.linkedin}<Arrow diagonal /></a><a href="https://github.com/gabbcarvzx" {...external}>{t.contact.github}<Arrow diagonal /></a></div></section>
    </main>
    <footer className="site-footer container"><span>© {new Date().getFullYear()} GABRIEL CARVALHO</span><span>{t.footer}</span><a href="#top">{lang === 'pt' ? 'Voltar ao topo' : 'Back to top'} ↑</a></footer>
  </>;
}
