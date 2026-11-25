import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ajouterEtudiant,
  getEtudiant,
  getEtudiants,
  getSession,
  login,
  logout,
  modifierEtudiant,
  supprimerEtudiant,
} from "./api";

const initialForm = {
  cne: "",
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  filiere: "Développement Digital",
  niveau: "1ère année",
  ville: "",
};

function App() {
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const needsSession = path === "/login" || path.startsWith("/dashboard") || path.startsWith("/etudiants");
    if (!needsSession) {
      setSessionLoading(false);
      return undefined;
    }
    let active = true;
    setSessionLoading(true);
    getSession()
      .then(value => { if (active) setSession(value); })
      .catch(() => { if (active) setSession(null); })
      .finally(() => { if (active) setSessionLoading(false); });
    return () => { active = false; };
  }, [location.pathname]);

  if (sessionLoading) return <div className="loading-screen" role="status">Chargement de votre session…</div>;

  return (
    <Routes>
      <Route path="/" element={<Accueil />} />
      <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <Login onLogin={setSession} />} />
      <Route path="/dashboard" element={<Prive session={session} onLogout={() => setSession(null)}><Dashboard /></Prive>} />
      <Route path="/etudiants" element={<Prive session={session} onLogout={() => setSession(null)}><Etudiants /></Prive>} />
      <Route path="/etudiants/ajouter" element={<Prive session={session} onLogout={() => setSession(null)}><Formulaire /></Prive>} />
      <Route path="/etudiants/:id" element={<Prive session={session} onLogout={() => setSession(null)}><Details /></Prive>} />
      <Route path="/etudiants/:id/modifier" element={<Prive session={session} onLogout={() => setSession(null)}><Formulaire modification /></Prive>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function Prive({ session, onLogout, children }) {
  return session ? <Layout session={session} onLogout={onLogout}>{children}</Layout> : <Navigate to="/login" replace />;
}

function Layout({ session, onLogout, children }) {
  const [sortieEnCours, setSortieEnCours] = useState(false);
  const [erreur, setErreur] = useState("");
  const navigate = useNavigate();

  async function sortir() {
    setSortieEnCours(true);
    setErreur("");
    try {
      await logout();
      onLogout();
      navigate("/login", { replace: true });
    } catch {
      setErreur("La déconnexion a échoué. Réessayez.");
    } finally {
      setSortieEnCours(false);
    }
  }

  return (
    <div className="app-layout">
      <aside className="sidebar" aria-label="Navigation principale">
        <Link to="/dashboard" className="brand"><span className="brand-icon" aria-hidden="true">É</span><span>EduGestion</span></Link>
        <p className="side-label">MENU PRINCIPAL</p>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}><span className="nav-icon" aria-hidden="true">▦</span><span>Tableau de bord</span></NavLink>
        <NavLink to="/etudiants" end className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}><span className="nav-icon" aria-hidden="true">♙</span><span>Étudiants</span></NavLink>
        <div className="side-bottom">
          <div className="profile"><div className="avatar" aria-hidden="true">{session.email.slice(0, 1).toUpperCase()}</div><div><b>Administrateur</b><small>{session.email}</small></div></div>
          <button className="logout" type="button" onClick={sortir} disabled={sortieEnCours}>{sortieEnCours ? "Déconnexion…" : "Se déconnecter"}</button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar"><span>Administration <b>/ Établissement</b></span><span className="top-user"><i aria-hidden="true" /> Connecté</span></header>
        {erreur && <div className="layout-error" role="alert">{erreur}</div>}
        {children}
      </main>
    </div>
  );
}

function Accueil() {
  return (
    <div className="landing">
      <nav className="landing-nav" aria-label="Navigation du site">
        <Link to="/" className="brand"><span className="brand-icon" aria-hidden="true">É</span> EduGestion</Link>
        <Link className="button button-light" to="/login">Se connecter <span aria-hidden="true">→</span></Link>
      </nav>
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">GESTION SCOLAIRE</span>
          <h1>Les informations de vos étudiants, <em>bien organisées.</em></h1>
          <p>Un espace simple pour consulter, rechercher et mettre à jour les dossiers de votre établissement.</p>
          <Link to="/login" className="button button-primary">Accéder à mon espace <span aria-hidden="true">→</span></Link>
          <div className="hero-note"><span aria-hidden="true">✓</span> Recherche rapide <span aria-hidden="true">✓</span> Dossiers centralisés</div>
        </div>
        <div className="hero-card" aria-label="Aperçu des fonctionnalités">
          <div className="mock-head"><span>Votre espace de gestion</span><span className="mock-dot" aria-hidden="true">●</span></div>
          <div className="mock-title">Tout au même endroit</div>
          <div className="mock-list"><div><span className="mock-icon blue">♙</span><span><b>Dossiers étudiants</b><small>Consulter et mettre à jour</small></span><b className="mock-arrow">→</b></div><div><span className="mock-icon purple">⌕</span><span><b>Recherche rapide</b><small>Retrouver une inscription</small></span><b className="mock-arrow">→</b></div><div><span className="mock-icon orange">▦</span><span><b>Vue d'ensemble</b><small>Suivre les inscriptions</small></span><b className="mock-arrow">→</b></div></div>
          <div className="mock-footer"><span>Un outil clair pour votre établissement</span></div>
        </div>
      </section>
      <footer>© 2026 EduGestion · Gestion des étudiants</footer>
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [montrerMotDePasse, setMontrerMotDePasse] = useState(false);
  const navigate = useNavigate();

  async function connecter(event) {
    event.preventDefault();
    setErreur("");
    setEnvoi(true);
    try {
      const utilisateur = await login(email.trim(), password);
      onLogin(utilisateur);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (error.status === 401) setErreur("Adresse e-mail ou mot de passe incorrect.");
      else if (error.status === 429) setErreur("Trop de tentatives. Attendez quelques minutes avant de réessayer.");
      else setErreur("Connexion impossible. Vérifiez que l’API est disponible.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <main className="login-page">
      <Link to="/" className="brand login-brand"><span className="brand-icon" aria-hidden="true">É</span> EduGestion</Link>
      <form className="login-card" onSubmit={connecter}>
        <div className="login-symbol" aria-hidden="true">♙</div>
        <span className="eyebrow">ESPACE ADMINISTRATEUR</span>
        <h1>Content de vous revoir</h1>
        <p>Connectez-vous pour gérer les dossiers de votre établissement.</p>
        {erreur && <div className="error" role="alert">{erreur}</div>}
        <label htmlFor="login-email">Adresse e-mail</label>
        <input id="login-email" name="email" type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="username" autoCapitalize="none" maxLength={254} required />
        <label htmlFor="login-password">Mot de passe</label>
        <div className="password-field"><input id="login-password" name="password" type={montrerMotDePasse ? "text" : "password"} value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" maxLength={128} required /><button type="button" className="password-toggle" onClick={() => setMontrerMotDePasse(value => !value)} aria-label={montrerMotDePasse ? "Masquer le mot de passe" : "Afficher le mot de passe"}>{montrerMotDePasse ? "Masquer" : "Afficher"}</button></div>
        <button className="button button-primary full" type="submit" disabled={envoi}>{envoi ? "Connexion…" : "Se connecter"}<span aria-hidden="true">→</span></button>
        <Link to="/" className="back-link">← Retour à l’accueil</Link>
      </form>
    </main>
  );
}

function useEtudiants() {
  const [etudiants, setEtudiants] = useState([]);
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(true);

  async function charger() {
    setChargement(true);
    try {
      setEtudiants(await getEtudiants());
      setErreur("");
    } catch {
      setErreur("Impossible de charger les étudiants. Vérifiez la connexion à l’API.");
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => { charger(); }, []);
  return { etudiants, erreur, chargement, charger };
}

function Dashboard() {
  const { etudiants, erreur, chargement } = useEtudiants();
  const filieres = new Set(etudiants.map(etudiant => etudiant.filiere)).size;
  const niveaux = new Set(etudiants.map(etudiant => etudiant.niveau)).size;

  return (
    <div className="page-content">
      <div className="page-heading"><div><span className="eyebrow">APERÇU GÉNÉRAL</span><h1>Tableau de bord</h1><p>Retrouvez ici un aperçu des inscriptions.</p></div><Link to="/etudiants/ajouter" className="button button-primary"><span aria-hidden="true">＋</span> Ajouter un étudiant</Link></div>
      {erreur && <div className="error" role="alert">{erreur}</div>}
      <div className="stats-grid" aria-live="polite">
        <Stat titre="Étudiants" nombre={chargement ? "—" : etudiants.length} icon="♙" couleur="blue" />
        <Stat titre="Filières" nombre={chargement ? "—" : filieres} icon="▤" couleur="purple" />
        <Stat titre="Niveaux" nombre={chargement ? "—" : niveaux} icon="◉" couleur="orange" />
      </div>
      <section className="panel" aria-labelledby="recent-title">
        <div className="panel-heading"><div><h2 id="recent-title">Ajouts récents</h2><p>Les derniers dossiers enregistrés</p></div><Link to="/etudiants" className="text-link">Voir tous les étudiants <span aria-hidden="true">→</span></Link></div>
        {chargement ? <p className="empty" role="status">Chargement des dossiers…</p> : <TableEtudiants etudiants={etudiants.slice(-4).reverse()} />}
      </section>
    </div>
  );
}

function Stat({ titre, nombre, icon, couleur }) {
  return <div className="stat-card"><div className={`stat-icon ${couleur}`} aria-hidden="true">{icon}</div><div><p>{titre}</p><strong>{nombre}</strong><small>Dans l’établissement</small></div></div>;
}

function Etudiants() {
  const { etudiants, erreur, chargement, charger } = useEtudiants();
  const [recherche, setRecherche] = useState("");
  const [actionEnCours, setActionEnCours] = useState(false);
  const [erreurAction, setErreurAction] = useState("");
  const resultat = useMemo(() => {
    const query = recherche.trim().toLocaleLowerCase("fr");
    return etudiants.filter(etudiant => [etudiant.nom, etudiant.prenom, etudiant.cne, etudiant.filiere, etudiant.email].some(value => value?.toLocaleLowerCase("fr").includes(query)));
  }, [etudiants, recherche]);

  async function supprimer(id, nom) {
    if (!window.confirm(`Supprimer le dossier de ${nom} ? Cette action est définitive.`)) return;
    setActionEnCours(true);
    setErreurAction("");
    try {
      await supprimerEtudiant(id);
      await charger();
    } catch {
      setErreurAction("La suppression a échoué. Réessayez.");
    } finally {
      setActionEnCours(false);
    }
  }

  return (
    <div className="page-content">
      <div className="page-heading"><div><span className="eyebrow">INSCRIPTIONS</span><h1>Étudiants</h1><p>Consultez et gérez les dossiers de votre établissement.</p></div><Link to="/etudiants/ajouter" className="button button-primary"><span aria-hidden="true">＋</span> Ajouter un étudiant</Link></div>
      <section className="panel" aria-labelledby="students-title">
        <div className="list-toolbar"><div><h2 id="students-title">Tous les dossiers <span className="count">{etudiants.length}</span></h2><p>Recherchez par nom, CNE, filière ou e-mail.</p></div><label className="search-label"><span aria-hidden="true">⌕</span><input className="search-input" type="search" aria-label="Rechercher un étudiant" placeholder="Rechercher…" value={recherche} onChange={event => setRecherche(event.target.value)} /></label></div>
        {erreur && <div className="error" role="alert">{erreur}</div>}
        {erreurAction && <div className="error" role="alert">{erreurAction}</div>}
        {chargement ? <p className="empty" role="status">Chargement des dossiers…</p> : resultat.length ? <TableEtudiants etudiants={resultat} onDelete={supprimer} disabled={actionEnCours} /> : <div className="empty-state"><span aria-hidden="true">⌕</span><h3>{recherche ? "Aucun résultat" : "Aucun dossier pour le moment"}</h3><p>{recherche ? "Essayez avec un autre nom, CNE ou filière." : "Ajoutez un premier étudiant pour commencer."}</p>{!recherche && <Link to="/etudiants/ajouter" className="button button-primary">Ajouter un étudiant</Link>}</div>}
      </section>
    </div>
  );
}

function TableEtudiants({ etudiants, onDelete, disabled = false }) {
  return (
    <div className="table-wrap"><table><thead><tr><th scope="col">ÉTUDIANT</th><th scope="col">CNE</th><th scope="col">FILIÈRE</th><th scope="col">NIVEAU</th><th scope="col">VILLE</th>{onDelete && <th scope="col">ACTIONS</th>}</tr></thead>
      <tbody>{etudiants.map(etudiant => {
        const nomComplet = `${etudiant.prenom || ""} ${etudiant.nom || ""}`.trim() || "Étudiant";
        return <tr key={etudiant.id}><td><div className="student-cell"><div className="student-avatar" aria-hidden="true">{etudiant.prenom?.[0]}{etudiant.nom?.[0]}</div><div><b>{nomComplet}</b><small>{etudiant.email}</small></div></div></td><td>{etudiant.cne}</td><td>{etudiant.filiere}</td><td><span className="level">{etudiant.niveau}</span></td><td>{etudiant.ville || "—"}</td>{onDelete && <td><div className="actions"><Link to={`/etudiants/${etudiant.id}`} aria-label={`Voir le dossier de ${nomComplet}`}>Voir</Link><Link to={`/etudiants/${etudiant.id}/modifier`} aria-label={`Modifier le dossier de ${nomComplet}`}>Modifier</Link><button type="button" disabled={disabled} onClick={() => onDelete(etudiant.id, nomComplet)} aria-label={`Supprimer le dossier de ${nomComplet}`}>Supprimer</button></div></td>}</tr>;
      })}</tbody>
    </table></div>
  );
}

function Details() {
  const { id } = useParams();
  const [etudiant, setEtudiant] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    let active = true;
    getEtudiant(id).then(value => { if (active) setEtudiant(value); }).catch(() => { if (active) setErreur("Étudiant introuvable ou API indisponible."); }).finally(() => { if (active) setChargement(false); });
    return () => { active = false; };
  }, [id]);

  if (chargement) return <div className="page-content"><p className="empty" role="status">Chargement du dossier…</p></div>;
  if (erreur || !etudiant) return <div className="page-content"><div className="error" role="alert">{erreur}</div><Link to="/etudiants" className="text-link">← Retour à la liste</Link></div>;
  const initiales = `${etudiant.prenom?.[0] || ""}${etudiant.nom?.[0] || ""}`;
  const details = [["CNE", etudiant.cne], ["E-mail", etudiant.email], ["Téléphone", etudiant.telephone], ["Filière", etudiant.filiere], ["Niveau", etudiant.niveau], ["Ville", etudiant.ville]];

  return (
    <div className="page-content">
      <Link to="/etudiants" className="back-link">← Retour aux étudiants</Link>
      <div className="page-heading"><div><span className="eyebrow">DOSSIER ÉTUDIANT</span><h1>{etudiant.prenom} {etudiant.nom}</h1><p>Informations personnelles et scolaires.</p></div><Link to={`/etudiants/${id}/modifier`} className="button button-primary">Modifier le dossier</Link></div>
      <section className="panel detail-panel"><div className="detail-person"><div className="big-avatar" aria-hidden="true">{initiales}</div><div><h2>{etudiant.prenom} {etudiant.nom}</h2><p>{etudiant.filiere}</p><span className="level">{etudiant.niveau}</span></div></div>
        <dl className="detail-grid">{details.map(([label, value]) => <div className="detail-item" key={label}><dt>{label}</dt><dd>{value || "Non renseigné"}</dd></div>)}</dl>
      </section>
    </div>
  );
}

function Formulaire({ modification = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(modification);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (!modification) return undefined;
    let active = true;
    getEtudiant(id)
      .then(etudiant => { if (active) setForm({ ...initialForm, ...etudiant }); })
      .catch(() => { if (active) setErreur("Étudiant introuvable ou API indisponible."); })
      .finally(() => { if (active) setChargement(false); });
    return () => { active = false; };
  }, [id, modification]);

  function changer(event) {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function envoyer(event) {
    event.preventDefault();
    setErreur("");
    setEnvoi(true);
    const donnees = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]));
    try {
      if (modification) await modifierEtudiant(id, donnees);
      else await ajouterEtudiant(donnees);
      navigate("/etudiants", { replace: true });
    } catch {
      setErreur("Enregistrement impossible. Vérifiez les champs et réessayez.");
    } finally {
      setEnvoi(false);
    }
  }

  if (chargement) return <div className="page-content"><p className="empty" role="status">Chargement du dossier…</p></div>;

  return (
    <div className="page-content">
      <Link to="/etudiants" className="back-link">← Retour aux étudiants</Link>
      <div className="page-heading"><div><span className="eyebrow">GESTION DES INSCRIPTIONS</span><h1>{modification ? "Modifier un étudiant" : "Ajouter un étudiant"}</h1><p>Les champs marqués d’un astérisque sont obligatoires.</p></div></div>
      <form className="panel student-form" onSubmit={envoyer}>
        {erreur && <div className="error" role="alert">{erreur}</div>}
        <h2>Informations de l’étudiant</h2>
        <div className="form-grid">
          <div><label htmlFor="student-cne">CNE <span aria-hidden="true">*</span></label><input id="student-cne" name="cne" value={form.cne} onChange={changer} required minLength={3} maxLength={30} autoComplete="off" placeholder="Ex. R130005" /></div>
          <div><label htmlFor="student-nom">Nom <span aria-hidden="true">*</span></label><input id="student-nom" name="nom" value={form.nom} onChange={changer} required maxLength={100} autoComplete="family-name" placeholder="Nom de famille" /></div>
          <div><label htmlFor="student-prenom">Prénom <span aria-hidden="true">*</span></label><input id="student-prenom" name="prenom" value={form.prenom} onChange={changer} required maxLength={100} autoComplete="given-name" placeholder="Prénom" /></div>
          <div><label htmlFor="student-email">E-mail <span aria-hidden="true">*</span></label><input id="student-email" type="email" name="email" value={form.email} onChange={changer} required maxLength={254} autoComplete="email" placeholder="exemple@ecole.ma" /></div>
          <div><label htmlFor="student-phone">Téléphone</label><input id="student-phone" type="tel" name="telephone" value={form.telephone} onChange={changer} maxLength={30} autoComplete="tel" placeholder="06 12 34 56 78" /></div>
          <div><label htmlFor="student-city">Ville</label><input id="student-city" name="ville" value={form.ville} onChange={changer} maxLength={100} autoComplete="address-level2" placeholder="Ville" /></div>
          <div><label htmlFor="student-track">Filière <span aria-hidden="true">*</span></label><select id="student-track" name="filiere" value={form.filiere} onChange={changer} required><option>Développement Digital</option><option>Gestion des entreprises</option><option>Infrastructure digitale</option><option>Comptabilité</option><option>Commerce</option></select></div>
          <div><label htmlFor="student-level">Niveau <span aria-hidden="true">*</span></label><select id="student-level" name="niveau" value={form.niveau} onChange={changer} required><option>1ère année</option><option>2ème année</option><option>3ème année</option></select></div>
        </div>
        <div className="form-actions"><Link to="/etudiants" className="button button-light">Annuler</Link><button className="button button-primary" type="submit" disabled={envoi}>{envoi ? "Enregistrement…" : modification ? "Enregistrer les modifications" : "Ajouter l’étudiant"}</button></div>
      </form>
    </div>
  );
}

function NotFound() {
  return <main className="not-found"><span className="eyebrow">PAGE INTROUVABLE</span><h1>404</h1><p>Cette page n’existe pas ou a été déplacée.</p><Link to="/" className="button button-primary">Retour à l’accueil</Link></main>;
}

export default App;
