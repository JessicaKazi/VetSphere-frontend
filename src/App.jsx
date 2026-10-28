import { useEffect, useMemo, useState } from 'react';
import { courseCatalog } from './courses.js';
import { freeCourses } from './freeCourses.js';
import { Activity, ArrowDownRight, ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, CircleHelp, Clock3, Compass, Dna, GraduationCap, HeartPulse, Leaf, Menu, Microscope, PawPrint, Search, ShieldCheck, Sparkles, Stethoscope, X } from 'lucide-react';

const categoryIcons = {
  'Foundations of Biology': Dna,
  'Anatomy & Physiology': Activity,
  'Animal Health & Welfare': HeartPulse,
  'Wildlife & Conservation': Leaf
};

const fallbackLessons = [
  { id: 'biology-basics', title: 'Biology: The Basics of Life', category: 'Foundations of Biology', level: 'Beginner', duration: '12 min', icon: '🧬', summary: 'Explore cells, living systems, and the characteristics shared by living organisms.', objectives: ['Describe a cell as a basic unit of life', 'Identify common characteristics of living things', 'Explain why observation and evidence matter in biology'], sections: [{ heading: 'What is biology?', body: 'Biology is the scientific study of living organisms and their interactions with one another and their environments.' }, { heading: 'Cells: the basic units of life', body: 'Cells are the smallest units generally considered living. Animals are multicellular and contain specialised cells that work together in tissues and organs.' }], safetyNote: 'This lesson is educational and does not provide a method for diagnosing an animal.' },
  { id: 'animal-body-systems', title: 'Introduction to Animal Body Systems', category: 'Anatomy & Physiology', level: 'Beginner', duration: '15 min', icon: '🫀', summary: 'Learn how organs and body systems cooperate to keep an animal alive.', objectives: ['Distinguish cells, tissues, organs, and organ systems', 'Name several major body systems'], sections: [{ heading: 'From cells to systems', body: 'Similar cells can form tissues; tissues combine to form organs; and organs cooperate within organ systems.' }, { heading: 'Systems work together', body: 'The respiratory system brings oxygen into the body, while the cardiovascular system transports oxygen in blood.' }], safetyNote: 'Animal anatomy differs by species. A learning diagram is not a substitute for veterinary examination or professional training.' },
  { id: 'animal-welfare', title: 'Animal Welfare and Responsible Care', category: 'Animal Health & Welfare', level: 'Beginner', duration: '10 min', icon: '🐾', summary: 'Understand welfare, basic needs, humane handling, and when to seek professional help.', objectives: ['Describe animal welfare in simple terms', 'Recognise the importance of species-specific needs'], sections: [{ heading: 'What is animal welfare?', body: 'Animal welfare concerns an animal’s physical and mental state. It includes health, comfort, nutrition, safety, and protection from avoidable pain, fear, and distress.' }, { heading: 'When to seek help', body: 'Sudden difficulty breathing, severe bleeding, collapse, suspected poisoning, or major injury can be emergencies. Contact a registered veterinarian or appropriate animal welfare service promptly.' }], safetyNote: 'This is general learning material, not veterinary advice. Never give an animal human medication or attempt a procedure based on a website lesson.' },
  { id: 'wildlife-ecosystems', title: 'Wildlife, Habitats, and Ecosystems', category: 'Wildlife & Conservation', level: 'Beginner', duration: '11 min', icon: '🌍', summary: 'Discover how animals interact with habitats, food webs, and conservation efforts.', objectives: ['Define habitat and ecosystem', 'Explain the idea of a food web'], sections: [{ heading: 'Habitats and ecosystems', body: 'A habitat is the place where an organism lives. An ecosystem includes living organisms and the non-living parts of their environment, along with their interactions.' }, { heading: 'Conservation and health', body: 'Conservation aims to protect species, habitats, and biodiversity. Human, domestic animal, and wildlife health can be connected through shared environments.' }], safetyNote: 'Do not approach, feed, capture, or handle wild animals. Follow local wildlife guidance.' }
];

const localQuiz = [
  { id: 'q1', question: 'What is generally considered the basic unit of life?', options: ['An organ', 'A cell', 'A habitat', 'An ecosystem'], answerIndex: 1, explanation: 'Cells are the basic structural and functional units of living organisms.' },
  { id: 'q2', question: 'Which statement best describes animal welfare?', options: ['Only whether an animal has food', 'Only whether an animal is free of disease', 'An animal’s physical and mental state', 'Whether an animal lives outdoors'], answerIndex: 2, explanation: 'Welfare includes physical health and comfort as well as mental state and relevant behavioural needs.' },
  { id: 'q3', question: 'What is a habitat?', options: ['The place where an organism lives', 'A group of organs', 'A type of cell', 'A veterinary qualification'], answerIndex: 0, explanation: 'A habitat is the environment or place in which an organism lives.' },
  { id: 'q4', question: 'An animal has sudden severe difficulty breathing. What is the safest response?', options: ['Wait several days', 'Give human medication', 'Try an invasive procedure', 'Contact a veterinarian or emergency animal service promptly'], answerIndex: 3, explanation: 'Severe breathing difficulty may be an emergency. Seek qualified veterinary help promptly and avoid untrained treatment.' }
];

const categories = ['All topics', 'Foundations of Biology', 'Anatomy & Physiology', 'Animal Health & Welfare', 'Wildlife & Conservation'];

export default function App() {
  const [lessons, setLessons] = useState(fallbackLessons);
  const [quizQuestions, setQuizQuestions] = useState(localQuiz);
  const [apiStatus, setApiStatus] = useState('connecting');
  const [activePage, setActivePage] = useState('home');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [category, setCategory] = useState('All topics');
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vetsphere-completed') || '[]'); } catch { return []; }
  });
  const [freeCourseCompleted, setFreeCourseCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vetsphere-free-course-completed') || '[]'); } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem('vetsphere-free-course-completed', JSON.stringify(freeCourseCompleted)); } catch { /* storage may be unavailable */ }
  }, [freeCourseCompleted]);
  const toggleFreeCourseModule = id => setFreeCourseCompleted(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('vetsphere-token') || '');
  const [student, setStudent] = useState(null);
  const [authMode, setAuthMode] = useState('register');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [quizSaveMessage, setQuizSaveMessage] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch('/api/health').then(r => { if (!r.ok) throw new Error('health'); return r.json(); }),
      fetch('/api/lessons').then(r => { if (!r.ok) throw new Error('lessons'); return r.json(); }),
      fetch('/api/quiz').then(r => { if (!r.ok) throw new Error('quiz'); return r.json(); })
    ]).then(([health, lessonData, quizData]) => {
      if (!alive) return;
      if (lessonData.lessons?.length) setLessons(lessonData.lessons);
      if (quizData.questions?.length) setQuizQuestions(quizData.questions.map(q => ({ ...q, answerIndex: localQuiz.find(a => a.id === q.id)?.answerIndex ?? 0, explanation: localQuiz.find(a => a.id === q.id)?.explanation ?? '' })));
      setApiStatus(health.database === 'connected' ? 'connected' : 'demo');
    }).catch(() => { if (alive) setApiStatus('offline'); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    try { localStorage.setItem('vetsphere-completed', JSON.stringify(completed)); } catch { /* storage may be unavailable */ }
  }, [completed]);

  useEffect(() => {
    if (!authToken) { setStudent(null); return; }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${authToken}` } })
      .then(async r => { const data = await r.json(); if (!r.ok) throw new Error(data.error || 'Please sign in again.'); return data; })
      .then(data => { setStudent(data.user); setCompleted(data.user.completedLessons || []); })
      .catch(() => { localStorage.removeItem('vetsphere-token'); setAuthToken(''); setStudent(null); });
  }, [authToken]);

  const submitAuth = async event => {
    event.preventDefault(); setAuthBusy(true); setAuthMessage('');
    try {
      const response = await fetch(`/api/auth/${authMode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: authName, email: authEmail, password: authPassword }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not sign in.');
      localStorage.setItem('vetsphere-token', data.token); setStudent(data.user); setAuthToken(data.token); setCompleted(data.user.completedLessons || []); setAuthPassword(''); setAuthMessage('Welcome to VetSphere! Your account is ready.');
    } catch (error) { setAuthMessage(error.message); }
    finally { setAuthBusy(false); }
  };

  const signOut = () => { localStorage.removeItem('vetsphere-token'); setAuthToken(''); setStudent(null); setAuthMessage('You have signed out.'); };


  const filteredLessons = useMemo(() => lessons.filter(lesson => {
    const matchesCategory = category === 'All topics' || lesson.category === category;
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || `${lesson.title} ${lesson.summary} ${lesson.category}`.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  }), [lessons, category, search]);

  const openLesson = lesson => { setSelectedLesson(lesson); setActivePage('lesson'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const navigate = page => { setActivePage(page); setSelectedLesson(null); if (page !== 'course') setSelectedCourse(null); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const openCourse = course => { setSelectedCourse(course); setActivePage('course'); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const markComplete = async id => {
    setCompleted(prev => prev.includes(id) ? prev : [...prev, id]);
    if (authToken) {
      try {
        const response = await fetch(`/api/progress/lessons/${encodeURIComponent(id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ completed: true }) });
        const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Could not sync progress.');
        setCompleted(data.completedLessons); setStudent(prev => prev ? { ...prev, completedLessons: data.completedLessons } : prev);
      } catch (error) { setAuthMessage(error.message); }
    }
  };

  const saveQuizAttempt = async () => {
    if (!authToken) { setQuizSaveMessage('Sign in to save this quiz result to your student profile.'); return; }
    try {
      const payload = Object.fromEntries(Object.entries(answers).map(([index, answer]) => [quizQuestions[Number(index)]?.id, answer]).filter(([id]) => id));
      const response = await fetch('/api/progress/quiz', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ answers: payload }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Could not save quiz result.');
      setQuizSaveMessage(`Saved to your profile: ${data.score}/${data.total}.`);
      setStudent(prev => prev ? { ...prev, quizAttempts: data.quizAttempts } : prev);
    } catch (error) { setQuizSaveMessage(error.message); }
  };
  const score = quizQuestions.reduce((sum, question, index) => sum + (answers[index] === question.answerIndex ? 1 : 0), 0);
  const restartQuiz = () => { setAnswers({}); setQuizIndex(0); setQuizSubmitted(false); };

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <header className="site-header">
      <button className="brand-button" onClick={() => navigate('home')} aria-label="VetSphere home">
        <span className="brand-mark"><PawPrint size={23} strokeWidth={2.4}/></span>
        <span className="brand-word">Vet<span>Sphere</span><small>VETERINARY LEARNING</small></span>
      </button>
      <button className="mobile-menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>{menuOpen ? <X/> : <Menu/>}</button>
      <nav className={menuOpen ? 'main-nav nav-open' : 'main-nav'} aria-label="Main navigation">
        <button className={activePage === 'home' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('home')}>Discover</button>
        <button className={activePage === 'courses' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('courses')}>Learning library</button>
        <button className={activePage === 'free-courses' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('free-courses')}>Free courses</button>
        <button className={['paths', 'course'].includes(activePage) ? 'nav-link active' : 'nav-link'} onClick={() => navigate('paths')}>Learning paths</button>
        <button className={activePage === 'quiz' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('quiz')}>Knowledge check</button>
        <button className={activePage === 'account' ? 'nav-link active' : 'nav-link'} onClick={() => { setAuthMessage(''); navigate('account'); }}>{student ? 'My learning' : 'Student account'}</button>
        <button className="nav-cta" onClick={() => navigate('courses')}>Start learning <ArrowRight size={16}/></button>
      </nav>
    </header>

    <main id="main-content">
      {activePage === 'home' && <>
        <section className="hero section-wrap">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot"/> YOUR JOURNEY INTO VETERINARY SCIENCE</div>
            <h1>Curiosity is the<br/>first step to <span className="highlight-text">care.</span></h1>
            <p className="hero-description">Build your animal science foundations, explore how living bodies work, and take your first steps toward a future in veterinary medicine.</p>
            <div className="hero-actions"><button className="primary-button" onClick={() => navigate('courses')}>Explore free lessons <ArrowRight size={17}/></button><button className="text-button" onClick={() => navigate('quiz')}><CircleHelp size={17}/> Try a quick quiz</button></div>
            <div className="hero-proof"><div className="proof-icon"><GraduationCap size={20}/></div><div><strong>Made for future animal health professionals</strong><span>Beginner-friendly · Always free · Learn at your pace</span></div></div>
          </div>
          <div className="hero-visual" aria-label="Illustration of a dog, cat, and veterinary science notes">
            <div className="visual-orbit orbit-one"/><div className="visual-orbit orbit-two"/>
            <div className="visual-label label-top"><span className="label-dot green-dot"/> SCIENCE-LED LEARNING</div>
            <div className="animal-art"><div className="animal-emoji">🐕</div><div className="animal-emoji cat-emoji">🐈</div><div className="leaf-sprig">✳</div></div>
            <div className="floating-card anatomy-card"><span className="floating-icon purple-icon"><Microscope size={19}/></span><span><strong>Understand anatomy</strong><small>One system at a time</small></span></div>
            <div className="floating-card welfare-card"><span className="floating-icon orange-icon"><HeartPulse size={19}/></span><span><strong>Care with compassion</strong><small>Welfare comes first</small></span></div>
            <div className="visual-stamp"><PawPrint size={22}/><span>LEARN<br/>WITH PURPOSE</span></div>
          </div>
        </section>

        <section className="stats-strip section-wrap" aria-label="Platform highlights">
          <div><span className="stat-number">{lessons.length.toString().padStart(2, '0')}</span><span className="stat-label">Starter lessons</span></div><div className="stat-divider"/><div><span className="stat-number">100<span className="stat-suffix">%</span></span><span className="stat-label">Free to explore</span></div><div className="stat-divider"/><div><span className="stat-number">Your</span><span className="stat-label">Own learning pace</span></div><div className="stat-note"><ShieldCheck size={17}/> Responsible, science-first learning</div>
        </section>

        <section className="learning-section section-wrap">
          <div className="section-heading"><div><div className="eyebrow">YOUR LEARNING JOURNEY</div><h2>Start with the <span className="serif-accent">foundations.</span></h2><p>Build your knowledge step by step, from the basics of life to the wellbeing of animals.</p></div><button className="subtle-link" onClick={() => navigate('courses')}>View all lessons <ArrowRight size={16}/></button></div>
          <LessonGrid lessons={lessons.slice(0, 3)} completed={completed} onOpen={openLesson}/>
        </section>

        <section className="pathway-section"><div className="section-wrap pathway-inner"><div className="pathway-copy"><div className="eyebrow light-eyebrow">A STRONGER START</div><h2>Learn the science.<br/><span>Grow your confidence.</span></h2><p>Veterinary medicine starts with understanding living things. Explore core concepts before moving into more advanced study.</p><button className="light-button" onClick={() => navigate('paths')}>Explore learning paths <ArrowRight size={16}/></button></div><div className="pathway-steps"><div className="path-step"><span className="step-number">01</span><span className="step-icon"><Dna size={20}/></span><div><strong>Understand life</strong><small>Cells, biology and evidence</small></div><ArrowDownRight size={17} className="step-arrow"/></div><div className="path-step"><span className="step-number">02</span><span className="step-icon"><Activity size={20}/></span><div><strong>Explore animal bodies</strong><small>Organs, systems and function</small></div><ArrowDownRight size={17} className="step-arrow"/></div><div className="path-step"><span className="step-number">03</span><span className="step-icon"><HeartPulse size={20}/></span><div><strong>Put welfare first</strong><small>Care, ethics and responsibility</small></div><Check size={17} className="step-arrow final-check"/></div></div></div></section>

        <section className="quiz-promo section-wrap"><div className="quiz-promo-icon"><Sparkles size={27}/></div><div className="quiz-promo-copy"><span className="eyebrow">A LITTLE KNOWLEDGE CHECK</span><h2>What do you already know?</h2><p>Try a short quiz and see what you remember. Every answer comes with an explanation.</p></div><button className="primary-button" onClick={() => navigate('quiz')}>Test your knowledge <ArrowRight size={17}/></button></section>
      </>}

      {activePage === 'paths' && <section className="library-page section-wrap">
        <div className="page-intro"><div className="eyebrow">STRUCTURED LEARNING PATHS</div><h1>Build knowledge, <span className="serif-accent">step by step.</span></h1><p>Follow beginner-friendly course paths designed to build the foundations for future veterinary study. Every path is free.</p></div>
        <div className="course-path-grid">{courseCatalog.map(course => { const done = course.lessonIds.filter(id => completed.includes(id)).length; const percent = Math.round(done / course.lessonIds.length * 100); return <article className="course-path-card" key={course.id}><div className="course-path-top"><span className="course-path-icon" aria-hidden="true">{course.icon}</span><span className="course-level">{course.level}</span></div><p className="course-category">{course.category}</p><h2>{course.title}</h2><p className="course-description">{course.description}</p><div className="course-meta"><span><BookOpen size={15}/> {course.lessonIds.length} lessons</span><span><Clock3 size={15}/> {course.duration}</span></div><div className="course-progress-label"><span>Your lesson progress</span><strong>{percent}%</strong></div><div className="course-progress-track" aria-label={`${percent}% of course lessons completed`}><span style={{width: `${percent}%`}}/></div><button className="primary-button" onClick={() => openCourse(course)}>View course <ArrowRight size={16}/></button></article>; })}</div>
        <div className="course-note"><ShieldCheck size={20}/><p><strong>A responsible start.</strong> These paths provide foundational education. They do not qualify a learner to diagnose, prescribe, or treat animals, and they are not a substitute for an accredited veterinary degree.</p></div>
      </section>}

      {activePage === 'course' && selectedCourse && <section className="library-page section-wrap"><button className="back-link" onClick={() => navigate('paths')}><ArrowLeft size={16}/> Back to learning paths</button><div className="course-detail-hero"><div className="course-detail-emoji" aria-hidden="true">{selectedCourse.icon}</div><div><div className="eyebrow">{selectedCourse.category.toUpperCase()} · {selectedCourse.level.toUpperCase()}</div><h1>{selectedCourse.title}</h1><p>{selectedCourse.description}</p><div className="course-meta"><span><BookOpen size={15}/> {selectedCourse.lessonIds.length} lessons</span><span><Clock3 size={15}/> {selectedCourse.duration}</span></div></div></div><div className="course-detail-columns"><div className="course-module-list"><h2>Course modules</h2><p className="course-muted">Complete the lessons in any order, or follow the sequence below.</p>{selectedCourse.lessonIds.map((id,index) => { const lesson=lessons.find(item=>item.id===id); if(!lesson) return null; return <article className="course-module" key={id}><span className="module-number">{completed.includes(id) ? <Check size={17}/> : String(index+1).padStart(2,'0')}</span><div className="module-copy"><h3>{lesson.title}</h3><p>{lesson.summary}</p><span>{lesson.duration} · {completed.includes(id) ? 'Completed' : 'Lesson'}</span></div><button className="module-open" onClick={() => openLesson(lesson)} aria-label={`Open lesson: ${lesson.title}`}><ArrowRight size={18}/></button></article>; })}</div><aside className="course-outcomes"><div className="sidebar-icon"><GraduationCap size={20}/></div><h2>Learning objectives</h2><p>By the end of this path, you should be able to:</p><ul>{selectedCourse.outcomes.map(outcome=><li key={outcome}><Check size={16}/>{outcome}</li>)}</ul><div className="course-safety"><ShieldCheck size={17}/><span>Learning material only. Seek a registered veterinarian for animal health concerns.</span></div></aside></div></section>}

      {activePage === 'free-courses' && <FreeCoursesPage completed={freeCourseCompleted} onToggleComplete={toggleFreeCourseModule} />}

      {activePage === 'courses' && <section className="library-page section-wrap"><div className="page-intro"><div className="eyebrow">THE LEARNING LIBRARY</div><h1>Find your next <span className="serif-accent">discovery.</span></h1><p>Choose a topic, follow your curiosity, and build a strong foundation in animal science.</p></div><div className="library-controls"><label className="search-box"><Search size={18}/><span className="sr-only">Search lessons</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search topics or lessons…"/></label><label className="filter-label"><span className="sr-only">Filter lessons by topic</span><select value={category} onChange={e => setCategory(e.target.value)}>{categories.map(item => <option key={item}>{item}</option>)}</select><ChevronDown size={16}/></label></div><p className="results-count">{filteredLessons.length} {filteredLessons.length === 1 ? 'lesson' : 'lessons'} to explore</p><LessonGrid lessons={filteredLessons} completed={completed} onOpen={openLesson}/>{filteredLessons.length === 0 && <div className="empty-state"><Search size={26}/><h3>No lessons found</h3><p>Try a different search or choose another topic.</p><button className="text-button" onClick={() => { setSearch(''); setCategory('All topics'); }}>Clear filters</button></div>}</section>}

      {activePage === 'lesson' && selectedLesson && <LessonPage lesson={selectedLesson} isComplete={completed.includes(selectedLesson.id)} onBack={() => navigate('courses')} onComplete={() => markComplete(selectedLesson.id)} onQuiz={() => navigate('quiz')}/>}

      {activePage === 'account' && <section className="library-page section-wrap">
        <div className="page-intro"><div className="eyebrow">YOUR LEARNING PROFILE</div><h1>{student ? `Welcome, ${student.name}.` : <>Your learning, <span className="serif-accent">your journey.</span></>}</h1><p>Create a free account to save completed lessons and quiz results across sessions and devices.</p></div>
        {student ? <div className="quiz-card"><h2>Student dashboard</h2><p><strong>{student.email}</strong></p><div className="stats-strip"><div><span className="stat-number">{completed.length}</span><span className="stat-label">Lessons completed</span></div><div><span className="stat-number">{student.quizAttempts?.length || 0}</span><span className="stat-label">Quiz attempts saved</span></div></div><h3>Completed lessons</h3>{completed.length ? <ul>{completed.map(id => <li key={id}>{lessons.find(l => l.id === id)?.title || id}</li>)}</ul> : <p>Complete a lesson and it will appear here.</p>}{student.quizAttempts?.length > 0 && <><h3>Recent quiz results</h3><ul>{student.quizAttempts.slice(-5).reverse().map((attempt, i) => <li key={`${attempt.completedAt || i}-${i}`}>{attempt.score}/{attempt.total} correct</li>)}</ul></>}<button className="text-button" onClick={signOut}>Sign out</button></div> : <form className="quiz-card" onSubmit={submitAuth} style={{maxWidth: 560, marginInline: 'auto'}}>
          <div className="answer-options" role="group" aria-label="Account action"><button type="button" className={`answer-option ${authMode === 'register' ? 'selected' : ''}`} onClick={() => {setAuthMode('register'); setAuthMessage('');}}>Create account</button><button type="button" className={`answer-option ${authMode === 'login' ? 'selected' : ''}`} onClick={() => {setAuthMode('login'); setAuthMessage('');}}>Sign in</button></div>
          {authMode === 'register' && <label className="auth-field">Your name<input autoComplete="name" required minLength={2} maxLength={70} value={authName} onChange={e => setAuthName(e.target.value)} /></label>}
          <label className="auth-field">Email address<input type="email" autoComplete="email" required maxLength={254} value={authEmail} onChange={e => setAuthEmail(e.target.value)} /></label>
          <label className="auth-field">Password<input type="password" autoComplete={authMode === 'register' ? 'new-password' : 'current-password'} required minLength={authMode === 'register' ? 10 : 1} maxLength={128} value={authPassword} onChange={e => setAuthPassword(e.target.value)} />{authMode === 'register' && <small>Use at least 10 characters.</small>}</label>
          {authMessage && <p role="status" aria-live="polite">{authMessage}</p>}<button className="primary-button" type="submit" disabled={authBusy}>{authBusy ? 'Please wait…' : authMode === 'register' ? 'Create free account' : 'Sign in'} <ArrowRight size={16}/></button><p className="footer-disclaimer">Accounts require the site owner to configure MongoDB. Never reuse a password from another service.</p>
        </form>}
      </section>}

      {activePage === 'quiz' && <section className="quiz-page section-wrap"><button className="back-link" onClick={() => navigate('home')}><ArrowLeft size={16}/> Back to discover</button><div className="quiz-header"><div className="quiz-icon"><CircleHelp size={26}/></div><div><div className="eyebrow">KNOWLEDGE CHECK</div><h1>Think you know <span className="serif-accent">your stuff?</span></h1><p>Take your time. This is about learning, not getting everything right first try.</p></div></div>{!quizSubmitted ? <div className="quiz-card"><div className="quiz-progress-row"><span>QUESTION {quizIndex + 1} OF {quizQuestions.length}</span><span>{Math.round((quizIndex + 1) / quizQuestions.length * 100)}% complete</span></div><div className="quiz-progress"><span style={{ width: `${(quizIndex + 1) / quizQuestions.length * 100}%` }}/></div><h2>{quizQuestions[quizIndex]?.question}</h2><div className="answer-options">{quizQuestions[quizIndex]?.options.map((option, index) => <button key={option} className={`answer-option ${answers[quizIndex] === index ? 'selected' : ''}`} onClick={() => setAnswers(prev => ({ ...prev, [quizIndex]: index }))}><span className="answer-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span>{answers[quizIndex] === index && <Check size={18}/>}</button>)}</div><div className="quiz-card-footer"><span>{Object.keys(answers).length} of {quizQuestions.length} answered</span><button className="primary-button" disabled={answers[quizIndex] === undefined} onClick={() => quizIndex < quizQuestions.length - 1 ? setQuizIndex(i => i + 1) : setQuizSubmitted(true)}>{quizIndex < quizQuestions.length - 1 ? 'Next question' : 'See results'} <ArrowRight size={16}/></button></div></div> : <div className="quiz-results"><div className="result-medal"><GraduationCap size={32}/></div><div className="eyebrow">QUIZ COMPLETE</div><h2>You scored {score} out of {quizQuestions.length}.</h2><p>{score === quizQuestions.length ? 'Excellent work! You have a strong start on these concepts.' : score >= Math.ceil(quizQuestions.length / 2) ? 'Good effort! Review the explanations below to strengthen your foundations.' : 'Every expert starts somewhere. Review the explanations, then give it another try.'}</p>{quizSaveMessage && <p role="status" aria-live="polite">{quizSaveMessage}</p>}<button className="text-button" onClick={saveQuizAttempt}>Save result to my profile</button><div className="review-list">{quizQuestions.map((q, i) => <div className="review-item" key={q.id}><span className={answers[i] === q.answerIndex ? 'review-status correct' : 'review-status incorrect'}>{answers[i] === q.answerIndex ? <Check size={15}/> : <X size={15}/>}</span><div><strong>{q.question}</strong><p>Correct answer: {q.options[q.answerIndex]}</p><small>{q.explanation}</small></div></div>)}</div><div className="result-actions"><button className="primary-button" onClick={restartQuiz}>Try again <ArrowRight size={16}/></button><button className="text-button" onClick={() => navigate('courses')}>Explore lessons</button></div></div>}</section>}
    </main>

    <footer className="site-footer"><div className="footer-main section-wrap"><div className="footer-brand"><button className="brand-button" onClick={() => navigate('home')}><span className="brand-mark"><PawPrint size={22}/></span><span className="brand-word">Vet<span>Sphere</span><small>VETERINARY LEARNING</small></span></button><p>Building the foundations for a future in animal health, one discovery at a time.</p></div><div className="footer-links"><strong>Explore</strong><button onClick={() => navigate('courses')}>Learning library</button><button onClick={() => navigate('free-courses')}>Free courses</button><button onClick={() => navigate('quiz')}>Knowledge check</button></div><div className="footer-links"><strong>Our promise</strong><span>Free foundational learning</span><span>Evidence-minded education</span><span>Animal welfare first</span></div></div><div className="footer-bottom section-wrap"><span>© {new Date().getFullYear()} VetSphere · Built for curious minds.</span><span className="footer-disclaimer"><ShieldCheck size={14}/> Educational resource, not a substitute for a veterinarian.</span><span className={`api-status ${apiStatus}`}><i/>{apiStatus === 'connected' ? 'Database connected' : apiStatus === 'demo' ? 'Demo data active' : apiStatus === 'offline' ? 'Offline demo' : 'Connecting'}</span></div></footer>
  </div>;
}


function FreeCoursesPage({ completed, onToggleComplete }) {
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const [answer, setAnswer] = useState(null);
  const course = freeCourses.find(item => item.id === selectedCourseId);
  const module = course?.modules[selectedModuleIndex];
  const doneCount = course ? course.modules.filter(item => completed.includes(item.id)).length : 0;
  const closeCourse = () => { setSelectedCourseId(null); setSelectedModuleIndex(0); setAnswer(null); };
  const chooseCourse = item => { setSelectedCourseId(item.id); setSelectedModuleIndex(0); setAnswer(null); window.scrollTo({top:0,behavior:'smooth'}); };
  const chooseModule = index => { setSelectedModuleIndex(index); setAnswer(null); };

  if (!course) return <section className="library-page section-wrap">
    <div className="page-intro"><div className="eyebrow">FREE IN-APP COURSES</div><h1>Learn veterinary foundations, <span className="serif-accent">right here.</span></h1><p>Self-paced beginner courses with original lessons, knowledge checks, and progress saved in this browser. You won't be sent to another site to study.</p></div>
    <div className="free-course-banner"><div className="free-course-banner-icon"><BookOpen size={25}/></div><div><strong>Free to learn. No external course sign-up.</strong><p>VetSphere creates its own learning experience around key subjects also covered by free public education programmes. It does not copy or claim to be the official version of any provider's course.</p></div></div>
    <div className="course-path-grid free-course-grid">{freeCourses.map(item => {const done=item.modules.filter(mod=>completed.includes(mod.id)).length; const percent=Math.round(done/item.modules.length*100); return <article className="course-path-card" key={item.id}><div className="course-path-top"><span className="course-path-icon" aria-hidden="true">{item.icon}</span><span className="course-level">{item.level}</span></div><p className="course-category">{item.category}</p><h2>{item.title}</h2><p className="course-description">{item.description}</p><div className="course-meta"><span><BookOpen size={15}/>{item.modules.length} modules</span><span><Clock3 size={15}/>{item.duration}</span></div><div className="course-progress-label"><span>Browser progress</span><strong>{percent}%</strong></div><div className="course-progress-track" aria-label={`${percent}% of modules completed`}><span style={{width:`${percent}%`}}/></div><button className="primary-button" onClick={()=>chooseCourse(item)}>{done===item.modules.length?'Review course':'Start course'} <ArrowRight size={16}/></button></article>;})}</div>
    <div className="course-note"><ShieldCheck size={20}/><p><strong>Educational use only.</strong> Courses build foundational knowledge; they do not qualify students to diagnose, prescribe, perform procedures, or treat animals. Real animal health concerns belong with a registered veterinarian.</p></div>
    <div className="free-course-attribution"><h2>Learning themes and further reading</h2><p>Course themes were selected after reviewing free educational resources from Wild Welfare and the University of Edinburgh on animal welfare, the FAO on One Health and animal health, and The Open University on animal biology and ecology. VetSphere lessons here are independently written summaries and activities.</p><p className="course-muted">To respect your no-redirect requirement, this page contains no outbound course buttons. Source organisations are named for transparency, not represented as VetSphere partners or endorsers.</p></div>
  </section>;

  return <section className="library-page section-wrap free-course-detail"><button className="back-link" onClick={closeCourse}><ArrowLeft size={16}/> Back to free courses</button><div className="course-detail-hero"><div className="course-detail-emoji" aria-hidden="true">{course.icon}</div><div><div className="eyebrow">VETSPHERE ORIGINAL COURSE · {course.category.toUpperCase()}</div><h1>{course.title}</h1><p>{course.description}</p><div className="course-meta"><span><BookOpen size={15}/>{course.modules.length} modules</span><span><Clock3 size={15}/>{course.duration}</span><span><Check size={15}/>{doneCount} completed</span></div></div></div>
    <div className="free-course-learning-layout"><aside className="free-module-nav"><h2>Course modules</h2><p className="course-muted">Choose a module to study it here.</p>{course.modules.map((item,index)=><button className={`free-module-nav-item ${index===selectedModuleIndex?'selected':''}`} key={item.id} onClick={()=>chooseModule(index)}><span className="module-number">{completed.includes(item.id)?<Check size={16}/>:String(index+1).padStart(2,'0')}</span><span><strong>{item.title}</strong><small>{item.duration} {completed.includes(item.id)?'· Completed':''}</small></span></button>)}</aside>
      <article className="free-module-content"><div className="eyebrow">MODULE {selectedModuleIndex+1} OF {course.modules.length}</div><h2>{module.title}</h2>{module.sections.map((section,index)=><section className="lesson-section" key={section.heading}><span className="lesson-section-number">{String(index+1).padStart(2,'0')}</span><div><h3>{section.heading}</h3><p>{section.body}</p></div></section>)}<div className="free-knowledge-check"><div className="content-eyebrow"><CircleHelp size={16}/> QUICK KNOWLEDGE CHECK</div><h3>{module.question}</h3><div className="answer-options">{module.options.map((option,index)=><button key={option} className={`answer-option ${answer===index?'selected':''} ${answer!==null && index===module.answer?'answer-correct':''}`} onClick={()=>setAnswer(index)} aria-pressed={answer===index}><span className="answer-letter">{String.fromCharCode(65+index)}</span><span>{option}</span>{answer===index&&<Check size={17}/>}</button>)}</div>{answer!==null&&<p className={answer===module.answer?'inline-feedback correct':'inline-feedback incorrect'} role="status">{answer===module.answer?'Correct. ':'Not quite. '}{module.explanation}</p>}</div><div className="safety-note"><ShieldCheck size={21}/><div><strong>Learn responsibly</strong><p>These original lessons are for foundational education, not veterinary diagnosis or treatment. Contact a registered veterinarian about real animal health concerns.</p></div></div><div className="free-module-actions"><button className="primary-button" onClick={()=>onToggleComplete(module.id)}>{completed.includes(module.id)?<><Check size={16}/> Mark as not complete</>:<>Mark module complete <Check size={16}/></>}</button><div className="free-module-next">{selectedModuleIndex>0&&<button className="text-button" onClick={()=>chooseModule(selectedModuleIndex-1)}><ArrowLeft size={15}/> Previous</button>}{selectedModuleIndex<course.modules.length-1&&<button className="primary-button" onClick={()=>chooseModule(selectedModuleIndex+1)}>Next module <ArrowRight size={15}/></button>}</div></div></article>
    </div><p className="course-muted free-source-note">{course.sourceNote}</p>
  </section>;
}

function LessonGrid({ lessons, completed, onOpen }) {
  if (!lessons.length) return null;
  return <div className="lesson-grid">{lessons.map((lesson, index) => {
    const Icon = categoryIcons[lesson.category] || BookOpen;
    return <article className={`lesson-card card-tone-${index % 4}`} key={lesson.id}><div className="lesson-card-top"><span className="lesson-art"><Icon size={25}/></span><span className="lesson-level">{lesson.level || 'Beginner'}</span>{completed.includes(lesson.id) && <span className="completed-badge"><Check size={13}/> Done</span>}</div><span className="lesson-category">{lesson.category}</span><h3>{lesson.title}</h3><p>{lesson.summary}</p><div className="lesson-card-bottom"><span><Clock3 size={14}/>{lesson.duration}</span><button onClick={() => onOpen(lesson)} aria-label={`Open lesson: ${lesson.title}`}>Explore lesson <ArrowRight size={15}/></button></div></article>;
  })}</div>;
}

function LessonPage({ lesson, isComplete, onBack, onComplete, onQuiz }) {
  const Icon = categoryIcons[lesson.category] || BookOpen;
  return <section className="lesson-page section-wrap"><button className="back-link" onClick={onBack}><ArrowLeft size={16}/> Back to learning library</button><div className="lesson-hero"><div className="lesson-hero-copy"><div className="eyebrow">{lesson.category}</div><span className="lesson-level">{lesson.level || 'Beginner'} · {lesson.duration}</span><h1>{lesson.title}</h1><p>{lesson.summary}</p><div className="lesson-hero-actions"><button className="primary-button" onClick={onComplete}>{isComplete ? <><Check size={17}/> Lesson completed</> : <>Mark as complete <Check size={17}/></>}</button><button className="text-button" onClick={onQuiz}><CircleHelp size={17}/> Take a knowledge check</button></div></div><div className="lesson-hero-art"><Icon size={74}/><span>{lesson.icon}</span></div></div><div className="lesson-content-layout"><article className="lesson-content"><div className="content-eyebrow"><BookOpen size={16}/> THE LESSON</div>{(lesson.sections || []).map((section, index) => <section key={section.heading} className="lesson-section"><span className="lesson-section-number">{String(index + 1).padStart(2, '0')}</span><div><h2>{section.heading}</h2><p>{section.body}</p></div></section>)}<div className="safety-note"><ShieldCheck size={21}/><div><strong>Keep learning responsibly</strong><p>{lesson.safetyNote || 'This content is for foundational education only and is not a substitute for qualified veterinary advice.'}</p></div></div></article><aside className="lesson-sidebar"><div className="sidebar-card"><div className="sidebar-icon"><Sparkles size={19}/></div><h3>What you'll learn</h3><ul>{(lesson.objectives || []).map(objective => <li key={objective}><Check size={15}/><span>{objective}</span></li>)}</ul><div className="sidebar-divider"/><div className="sidebar-meta"><Clock3 size={15}/><span>Estimated time</span><strong>{lesson.duration}</strong></div><div className="sidebar-meta"><GraduationCap size={15}/><span>Level</span><strong>{lesson.level || 'Beginner'}</strong></div></div><div className="help-card"><Stethoscope size={22}/><strong>Curiosity is a great start.</strong><p>Professional veterinary training includes supervised practical work and accredited study.</p></div></aside></div></section>;
}
