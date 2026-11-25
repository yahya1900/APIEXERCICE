import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { getEtudiants, getEtudiant, ajouterEtudiant, modifierEtudiant, supprimerEtudiant } from "./api";

function App() {
  const [connecte, setConnecte] = useState(Boolean(localStorage.getItem("admin")));
  function deconnexion() {
    localStorage.removeItem("admin");
    setConnecte(false);
  }

  return (
    <Routes>
      <Route path="/" element={<Accueil />} />
      <Route path="/login" element={connecte ? <Navigate to="/dashboard" /> : <Login onLogin={() => setConnecte(true)} />} />
      <Route path="/dashboard" element={<Prive connecte={connecte}><Dashboard /></Prive>} />
      <Route path="/etudiants" element={<Prive connecte={connecte}><Etudiants /></Prive>} />
      <Route path="/etudiants/ajouter" element={<Prive connecte={connecte}><Formulaire /></Prive>} />
      <Route path="/etudiants/:id" element={<Prive connecte={connecte}><Details /></Prive>} />
      <Route path="/etudiants/:id/modifier" element={<Prive connecte={connecte}><Formulaire modification /></Prive>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function Prive({ connecte, children }) {
  return connecte ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

function Layout({ children }) {
  const navigate = useNavigate();
  function sortir() {
    localStorage.removeItem("admin");
    navigate("/login");
    window.location.reload();
  }
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Link to="/dashboard" className="brand"><span className="brand-icon">É</span><span>EduGestion</span></Link>
        <p className="side-label">MENU PRINCIPAL</p>
        <Link to="/dashboard" className="nav-link">▦ <span>Tableau de bord</span></Link>
        <Link to="/etudiants" className="nav-link">♙ <span>Étudiants</span></Link>
        <div className="side-bottom">
          <div className="profile"><div className="avatar">AD</div><div><b>Administrateur</b><small>Gestionnaire</small></div></div>
          <button className="logout" onClick={sortir}>↪ Déconnexion</button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar"><span>Administration / <b>Établissement</b></span><span className="top-user">● En ligne</span></header>
        {children}
      </main>
    </div>
  );
}

function Accueil() {
  return (
    <div className="landing">
      <nav className="landing-nav"><Link to="/" className="brand"><span className="brand-icon">É</span> EduGestion</Link><Link className="button button-light" to="/login">Se connecter</Link></nav>
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">PLATEFORME DE GESTION SCOLAIRE</span>
          <h1>La gestion des étudiants, <em>plus simple.</em></h1>
          <p>Une plateforme claire et pratique pour organiser les informations des étudiants de votre établissement de formation.</p>
          <Link to="/login" className="button button-primary">Accéder à mon espace <span>→</span></Link>
          <div className="hero-note">✓ Simple &nbsp; ✓ Rapide &nbsp; ✓ Centralisé</div>
        </div>
        <div className="hero-card">
          <div className="mock-head"><span>Vue d'ensemble</span><span className="mock-dot">●</span></div>
          <div className="mock-number">1 248 <small>étudiants inscrits</small></div>
          <div className="mock-bars"><i style={{height:"42%"}}/><i style={{height:"68%"}}/><i style={{height:"53%"}}/><i style={{height:"85%"}}/><i style={{height:"62%"}}/><i style={{height:"100%"}}/><i style={{height:"76%"}}/></div>
          <div className="mock-footer"><span>Inscriptions</span><b>+12,8%</b></div>
        </div>
      </section>
      <footer>© 2026 EduGestion · Gestion des étudiants</footer>
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@ecole.ma");
  const [password, setPassword] = useState("admin123");
  const [erreur, setErreur] = useState("");
  const navigate = useNavigate();

  async function connecter(e) {
    e.preventDefault();
    setErreur("");
    try {
      const response = await fetch("http://localhost:3001/users");
      if (!response.ok) throw new Error();
      const users = await response.json();
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        setErreur("Email ou mot de passe incorrect.");
        return;
      }
      localStorage.setItem("admin", JSON.stringify({ name: user.name, email: user.email }));
      onLogin();
      navigate("/dashboard");
    } catch {
      setErreur("API inaccessible. Vérifiez que JSON Server est démarré.");
    }
  }

  return (
    <div className="login-page">
      <Link to="/" className="brand login-brand"><span className="brand-icon">É</span> EduGestion</Link>
      <form className="login-card" onSubmit={connecter}>
        <div className="login-symbol">♙</div>
        <h1>Bon retour !</h1><p>Connectez-vous à votre espace administrateur.</p>
        {erreur && <div className="error">{erreur}</div>}
        <label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <label>Mot de passe</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button className="button button-primary full">Se connecter <span>→</span></button>
        <small className="demo-info">Démo : admin@ecole.ma / admin123</small>
        <Link to="/" className="back-link">← Retour à l'accueil</Link>
      </form>
    </div>
  );
}

function Dashboard() {
  const [etudiants, setEtudiants] = useState([]);
  const [erreur, setErreur] = useState("");
  useEffect(() => {
    getEtudiants().then(setEtudiants).catch(() => setErreur("Impossible de charger les données. Vérifiez JSON Server."));
  }, []);
  const filieres = [...new Set(etudiants.map(e => e.filiere))].length;
  return (
    <div className="page-content">
      <div className="page-heading"><div><span className="eyebrow">APERÇU GÉNÉRAL</span><h1>Tableau de bord</h1><p>Bienvenue dans votre espace de gestion.</p></div><Link to="/etudiants/ajouter" className="button button-primary">＋ Ajouter un étudiant</Link></div>
      {erreur && <div className="error">{erreur}</div>}
      <div className="stats-grid">
        <Stat titre="Total étudiants" nombre={etudiants.length} icon="♙" couleur="blue" />
        <Stat titre="Filières" nombre={filieres} icon="▤" couleur="purple" />
        <Stat titre="Niveaux" nombre={[...new Set(etudiants.map(e => e.niveau))].length} icon="◎" couleur="orange" />
      </div>
      <section className="panel">
        <div className="panel-heading"><div><h2>Étudiants récemment ajoutés</h2><p>Aperçu des inscriptions</p></div><Link to="/etudiants" className="text-link">Voir tous →</Link></div>
        <TableEtudiants etudiants={etudiants.slice(-4).reverse()} />
      </section>
    </div>
  );
}

function Stat({ titre, nombre, icon, couleur }) {
  return <div className="stat-card"><div className={`stat-icon ${couleur}`}>{icon}</div><div><p>{titre}</p><strong>{nombre}</strong><small>Enregistré(s)</small></div></div>;
}

function Etudiants() {
  const [etudiants, setEtudiants] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(true);
  async function charger() {
    try { setEtudiants(await getEtudiants()); setErreur(""); }
    catch { setErreur("Impossible de charger les étudiants. Vérifiez JSON Server."); }
    finally { setChargement(false); }
  }
  useEffect(() => { charger(); }, []);
  async function supprimer(id) {
    if (!window.confirm("Voulez-vous vraiment supprimer cet étudiant ?")) return;
    try { await supprimerEtudiant(id); charger(); }
    catch { setErreur("La suppression a échoué."); }
  }
  const resultat = etudiants.filter(e => `${e.nom} ${e.prenom} ${e.cne} ${e.filiere}`.toLowerCase().includes(recherche.toLowerCase()));
  return (
    <div className="page-content">
      <div className="page-heading"><div><span className="eyebrow">BASE DE DONNÉES</span><h1>Liste des étudiants</h1><p>Consultez et gérez les étudiants de votre établissement.</p></div><Link to="/etudiants/ajouter" className="button button-primary">＋ Ajouter un étudiant</Link></div>
      <section className="panel">
        <div className="list-toolbar"><div><h2>Tous les étudiants <span className="count">{etudiants.length}</span></h2><p>Liste complète des inscriptions</p></div><input className="search-input" placeholder="⌕  Rechercher un étudiant..." value={recherche} onChange={e => setRecherche(e.target.value)} /></div>
        {erreur && <div className="error">{erreur}</div>}
        {chargement ? <p className="empty">Chargement...</p> : <TableEtudiants etudiants={resultat} onDelete={supprimer} />}
        {!chargement && resultat.length === 0 && <p className="empty">Aucun étudiant trouvé.</p>}
      </section>
    </div>
  );
}

function TableEtudiants({ etudiants, onDelete }) {
  return (
    <div className="table-wrap"><table><thead><tr><th>ÉTUDIANT</th><th>CNE</th><th>FILIÈRE</th><th>NIVEAU</th><th>VILLE</th><th>ACTIONS</th></tr></thead>
      <tbody>{etudiants.map(e => <tr key={e.id}><td><div className="student-cell"><div className="student-avatar">{e.prenom?.[0]}{e.nom?.[0]}</div><div><b>{e.prenom} {e.nom}</b><small>{e.email}</small></div></div></td><td>{e.cne}</td><td>{e.filiere}</td><td><span className="level">{e.niveau}</span></td><td>{e.ville}</td><td><div className="actions"><Link title="Détails" to={`/etudiants/${e.id}`}>Voir</Link><Link title="Modifier" to={`/etudiants/${e.id}/modifier`}>Modifier</Link>{onDelete && <button title="Supprimer" onClick={() => onDelete(e.id)}>Supprimer</button>}</div></td></tr>)}</tbody>
    </table></div>
  );
}

function Details() {
  const { id } = useParams();
  const [etudiant, setEtudiant] = useState(null);
  const [erreur, setErreur] = useState("");
  useEffect(() => { getEtudiant(id).then(setEtudiant).catch(() => setErreur("Étudiant introuvable.")); }, [id]);
  if (erreur) return <div className="page-content"><div className="error">{erreur}</div><Link to="/etudiants" className="text-link">← Retour à la liste</Link></div>;
  if (!etudiant) return <div className="page-content">Chargement...</div>;
  return (
    <div className="page-content">
      <Link to="/etudiants" className="back-link">← Retour à la liste</Link>
      <div className="page-heading"><div><span className="eyebrow">FICHE ÉTUDIANT</span><h1>Détails de l'étudiant</h1><p>Informations personnelles et scolaires.</p></div><Link to={`/etudiants/${id}/modifier`} className="button button-primary">Modifier</Link></div>
      <section className="panel detail-panel"><div className="detail-person"><div className="big-avatar">{etudiant.prenom[0]}{etudiant.nom[0]}</div><div><h2>{etudiant.prenom} {etudiant.nom}</h2><p>{etudiant.filiere}</p><span className="level">{etudiant.niveau}</span></div></div>
        <div className="detail-grid">{[["CNE",etudiant.cne],["Email",etudiant.email],["Téléphone",etudiant.telephone],["Filière",etudiant.filiere],["Niveau",etudiant.niveau],["Ville",etudiant.ville]].map(([k,v]) => <div className="detail-item" key={k}><small>{k}</small><b>{v || "Non renseigné"}</b></div>)}</div>
      </section>
    </div>
  );
}

function Formulaire({ modification = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ cne:"", nom:"", prenom:"", email:"", telephone:"", filiere:"Développement Digital", niveau:"1ère année", ville:"" });
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(modification);
  useEffect(() => {
    if (modification) getEtudiant(id).then(e => setForm({ cne:e.cne || "", nom:e.nom || "", prenom:e.prenom || "", email:e.email || "", telephone:e.telephone || "", filiere:e.filiere || "Développement Digital", niveau:e.niveau || "1ère année", ville:e.ville || "" })).catch(() => setErreur("Étudiant introuvable.")).finally(() => setChargement(false));
  }, [id, modification]);
  function changer(e) { setForm({ ...form, [e.target.name]: e.target.value }); }
  async function envoyer(e) {
    e.preventDefault(); setErreur("");
    try {
      if (modification) await modifierEtudiant(id, form);
      else await ajouterEtudiant(form);
      navigate("/etudiants");
    } catch { setErreur("Une erreur est survenue. Vérifiez que JSON Server fonctionne."); }
  }
  if (chargement) return <div className="page-content">Chargement...</div>;
  return (
    <div className="page-content">
      <Link to="/etudiants" className="back-link">← Retour à la liste</Link>
      <div className="page-heading"><div><span className="eyebrow">GESTION DES INSCRIPTIONS</span><h1>{modification ? "Modifier un étudiant" : "Ajouter un étudiant"}</h1><p>Remplissez les informations ci-dessous.</p></div></div>
      <form className="panel student-form" onSubmit={envoyer}>
        {erreur && <div className="error">{erreur}</div>}
        <h2>Informations de l'étudiant</h2>
        <div className="form-grid">
          <div><label>CNE *</label><input name="cne" value={form.cne} onChange={changer} required placeholder="Ex : R130005" /></div>
          <div><label>Nom *</label><input name="nom" value={form.nom} onChange={changer} required placeholder="Nom de famille" /></div>
          <div><label>Prénom *</label><input name="prenom" value={form.prenom} onChange={changer} required placeholder="Prénom" /></div>
          <div><label>Email *</label><input type="email" name="email" value={form.email} onChange={changer} required placeholder="exemple@email.com" /></div>
          <div><label>Téléphone</label><input name="telephone" value={form.telephone} onChange={changer} placeholder="06XXXXXXXX" /></div>
          <div><label>Ville</label><input name="ville" value={form.ville} onChange={changer} placeholder="Ville" /></div>
          <div><label>Filière *</label><select name="filiere" value={form.filiere} onChange={changer}><option>Développement Digital</option><option>Gestion des entreprises</option><option>Infrastructure digitale</option><option>Comptabilité</option><option>Commerce</option></select></div>
          <div><label>Niveau *</label><select name="niveau" value={form.niveau} onChange={changer}><option>1ère année</option><option>2ème année</option><option>3ème année</option></select></div>
        </div>
        <div className="form-actions"><Link to="/etudiants" className="button button-light">Annuler</Link><button className="button button-primary" type="submit">{modification ? "Enregistrer les modifications" : "Ajouter l'étudiant"}</button></div>
      </form>
    </div>
  );
}

function NotFound() {
  return <div className="not-found"><h1>404</h1><p>Cette page n'existe pas.</p><Link to="/" className="button button-primary">Retour à l'accueil</Link></div>;
}

export default App;
