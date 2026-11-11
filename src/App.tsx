import { useEffect, useState } from 'react';
import { content, type Language, type Project } from './content';
import MotionScene from './MotionScene';

const getLanguage = (): Language => location.pathname.startsWith('/en') ? 'en' : 'pt';
const external = { target: '_blank', rel: 'noopener noreferrer' } as const;

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={diagonal ? 'M5 19 19 5M7 5h12v12' : 'M4 12h16m-6-6 6 6-6 6'} /></svg>;
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
  const caseId = location.pathname.match(/^\/(?:pt|en)\/projects\/(pelada|giraffas|exclusiva|prime)\/?$/)?.[1];
  const caseProject = t.projects.find(project => project.id === caseId) as Project | undefined;
  const home = `/${lang}`;

  useEffect(() => {
    if (location.pathname === '/') history.replaceState({}, '', `/${lang}${location.hash}`);
    const onPop = () => { setLang(getLanguage()); setMenuOpen(false); };
    addEventListener('popstate', onPop);
    return () => removeEventListener('popstate', onPop);
  }, [lang]);

  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    document.title = caseProject ? `${caseProject.name} — Gabriel Carvalho` : t.metaTitle;
    const description = document.querySelector('meta[name="description"]') ?? document.head.appendChild(document.createElement('meta'));
    description.setAttribute('name', 'description'); description.setAttribute('content', caseProject?.details ?? t.metaDescription);
    const og = document.querySelector('meta[property="og:title"]') ?? document.head.appendChild(document.createElement('meta'));
    og.setAttribute('property', 'og:title'); og.setAttribute('content', document.title);
    const ogDesc = document.querySelector('meta[property="og:description"]') ?? document.head.appendChild(document.createElement('meta'));
    ogDesc.setAttribute('property', 'og:description'); ogDesc.setAttribute('content', caseProject?.details ?? t.metaDescription);
    const version = document.querySelector('meta[name="portfolio-version"]') ?? document.head.appendChild(document.createElement('meta'));
    version.setAttribute('name', 'portfolio-version'); version.setAttribute('content', import.meta.env.VITE_BUILD_SHA || import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA || 'local');
  }, [lang, t, caseProject]);

  const changeLanguage = (next: Language) => {
    if (next === lang) return;
    const path = caseId ? `/${next}/projects/${caseId}` : `/${next}`;
    location.assign(`${path}${location.hash}`);
  };
  const togglePaused = () => setPaused(value => { localStorage.setItem('ambient-paused', String(!value)); return !value; });
  const closeMenu = () => setMenuOpen(false);
  const featured = t.projects[0];

  return <>
    <MotionScene paused={paused} />
    <a className="skip-link" href="#main">{lang === 'pt' ? 'Ir para o conteúdo' : 'Skip to content'}</a>
    <header className="site-header">
      <a className="wordmark" href={`${home}#top`} onClick={closeMenu} aria-label={lang === 'pt' ? 'Gabriel Carvalho — início' : 'Gabriel Carvalho — home'}>GC<span className="wordmark__dot">.</span></a>
      <button className="menu-button" type="button" aria-label={menuOpen ? t.nav.close : t.nav.menu} aria-expanded={menuOpen} aria-controls="site-nav" onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
      <nav id="site-nav" className={menuOpen ? 'nav nav--open' : 'nav'} aria-label={lang === 'pt' ? 'Navegação principal' : 'Main navigation'}>
        <a href={`${home}#projects`} onClick={closeMenu}>{t.nav.projects}</a><a href={`${home}#about`} onClick={closeMenu}>{t.nav.about}</a><a href={`${home}#contact`} onClick={closeMenu}>{t.nav.contact}</a>
        <a className="nav-whatsapp" href="https://wa.me/5581992796870" {...external}>{t.contact.whatsapp}<Arrow diagonal /></a>
        <div className="lang-switch" aria-label={lang === 'pt' ? 'Idioma' : 'Language'}><button type="button" aria-current={lang === 'pt' ? 'page' : undefined} onClick={() => changeLanguage('pt')}>PT</button><span>/</span><button type="button" aria-current={lang === 'en' ? 'page' : undefined} onClick={() => changeLanguage('en')}>EN</button></div>
      </nav>
    </header>

    <main id="main">
      {caseProject ? <article className="case-page container">
        <div className="case-topline"><a className="case-back" href={`${home}#projects`}>← {t.labels.back}</a><button type="button" className="motion-control" onClick={togglePaused} aria-pressed={paused}>{paused ? t.labels.play : t.labels.pause}<span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span></button></div>
        <div className="case-heading"><div><span className="case-kicker">{caseProject.category}</span><h1>{caseProject.name}<span className="acid-dot">.</span></h1></div><p>{caseProject.details}</p></div>
        <ProjectVisual project={caseProject} featured lang={lang} />
        <div className="case-grid">
          <section><h2>{t.labels.context}</h2><p>{caseProject.context}</p></section>
          <section><h2>{t.labels.need}</h2><p>{caseProject.need}</p></section>
          <section><h2>{t.labels.features}</h2><ul>{caseProject.features.map(feature => <li key={feature}>{feature}</li>)}</ul></section>
          <section><h2>{t.labels.process}</h2><p>{caseProject.contribution}</p></section>
          <section className="case-grid__wide"><h2>{t.labels.ai}</h2><p>{caseProject.process}</p></section>
          {caseProject.stack && <section><h2>{t.labels.technology}</h2><p>{caseProject.stack}</p></section>}
        </div>
        <ProjectLinks project={caseProject} live={t.labels.live} code={t.labels.code} />
        <a className="case-whatsapp" href="https://wa.me/5581992796870" {...external}>{t.contact.whatsapp}<Arrow diagonal /></a>
      </article> : <>
      <section className="hero container" id="top" aria-labelledby="hero-title">
        <div className="hero__top"><p>{t.hero.lead}</p><span>{t.portfolio}</span></div>
        <h1 id="hero-title"><span>Gabriel</span><span>Carvalho<span className="hero__period">.</span></span></h1>
        <div className="hero__bottom"><p>{t.hero.line}</p><a className="round-action" href="#projects"><span>{t.hero.action}</span><span className="round-action__icon magnet-core"><Arrow /></span></a></div>
        <div className="hero__foot"><span>{t.hero.scroll}</span><button type="button" className="motion-control" onClick={togglePaused} aria-pressed={paused}>{paused ? t.labels.play : t.labels.pause}<span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span></button></div>
      </section>

      <section className="featured-section container" id="projects" aria-labelledby="featured-title">
        <div className="section-heading"><h2 id="featured-title">{t.labels.selected}</h2></div>
        <div className="featured-intro"><div><h3>{featured.name}</h3></div><p>{t.featured.title}</p></div>
        <a href={featured.live} {...external} className="visual-link" aria-label={`${t.labels.live}: ${featured.name}`}><ProjectVisual project={featured} featured lang={lang} /></a>
        <div className="featured-detail"><p>{t.featured.body}</p><div><span>{t.labels.process}</span><p>{featured.contribution}</p><a className="story-link" href={`${home}/projects/${featured.id}`}>{t.labels.story}<Arrow /></a><ProjectLinks project={featured} live={t.labels.live} code={t.labels.code} /></div></div>
      </section>

      <section className="more-section container" aria-labelledby="more-title"><div className="section-heading"><h2 id="more-title">{t.labels.more}</h2></div>
        <div className="project-list">{t.projects.slice(1).map((project, index) => <article className={`project-row project-row--${index}`} key={project.id}>
          <div className="project-row__copy"><span>{project.category}</span><h3>{project.name}</h3><p>{project.details}</p><p className="project-row__contribution">{project.contribution}</p><a className="story-link" href={`${home}/projects/${project.id}`}>{t.labels.story}<Arrow /></a><ProjectLinks project={project} live={t.labels.live} code={t.labels.code} /></div>
          <a href={project.live} {...external} className="visual-link" aria-label={`${t.labels.live}: ${project.name}`}><ProjectVisual project={project} lang={lang} /></a>
        </article>)}</div>
      </section>

      <section className="about-section" id="about" aria-labelledby="about-title"><div className="container about-grid"><h2 id="about-title">{t.about.title}<span className="acid-dot">.</span></h2><div><p className="about-lead">{t.about.first}</p><p>{t.about.second}</p><div className="about-tags"><span>UNINASSAU</span><span>{t.englishLevel}</span><span>VANCOUVER</span></div></div></div></section>
      <section className="contact-section container" id="contact" aria-labelledby="contact-title"><p>{t.contact.body}</p><h2 id="contact-title">{t.contact.title}</h2><div className="contact-links"><a className="contact-whatsapp" href="https://wa.me/5581992796870" {...external}><span className="magnet-core">{t.contact.whatsapp}<Arrow diagonal /></span></a><a href="https://www.linkedin.com/in/gabrielcarvalhours" {...external}>{t.contact.linkedin}<Arrow diagonal /></a><a href="https://github.com/gabbcarvzx" {...external}>{t.contact.github}<Arrow diagonal /></a></div></section>
      </>}
    </main>
    <footer className="site-footer container"><span>© {new Date().getFullYear()} GABRIEL CARVALHO</span><span>{t.footer}</span><a href={`${home}#top`}>{lang === 'pt' ? 'Voltar ao topo' : 'Back to top'} ↑</a></footer>
  </>;
}
