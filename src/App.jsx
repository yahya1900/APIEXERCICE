
import { useState } from "react";

export function Inscription() {
  const [form, setForm] = useState({
    nom: "",
    email: "",
    password: "",
    confirmation: ""
  });

  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleBlur = (e) => {
    setTouched({
      ...touched,
      [e.target.name]: true
    });
  };

  const errors = {
    nom: form.nom.length < 3
      ? "Minimum 3 caractères"
      : "",

    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
      ? "Email invalide"
      : "",

    password: !/^(?=.*\d).{8,}$/.test(form.password)
      ? "8 caractères minimum et 1 chiffre"
      : "",

    confirmation: form.confirmation !== form.password ||
      form.confirmation === ""
      ? "Les mots de passe ne correspondent pas"
      : ""
  };

  const isValid = Object.values(errors).every(
    (error) => error === ""
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Inscription réussie !");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Inscription</h2>

      <input
        name="nom"
        placeholder="Nom"
        value={form.nom}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {touched.nom && <p>{errors.nom}</p>}

      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {touched.email && <p>{errors.email}</p>}

      <input
        type="password"
        name="password"
        placeholder="Mot de passe"
        value={form.password}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {touched.password && <p>{errors.password}</p>}

      <input
        type="password"
        name="confirmation"
        placeholder="Confirmer le mot de passe"
        value={form.confirmation}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {touched.confirmation && (
        <p>{errors.confirmation}</p>
      )}

      <button type="submit" disabled={!isValid}>
        Envoyer
      </button>
    </form>
  );
}





export function Formulaire() {
  const [form, setForm] = useState({
    nom: "",
    email: "",
    pays: "",
    cgu: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.cgu) {
      alert("Veuillez accepter les CGU");
      return;
    }

    console.log(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="nom"
        placeholder="Nom"
        value={form.nom}
        onChange={handleChange}
      />

      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />

      <select
        name="pays"
        value={form.pays}
        onChange={handleChange}
      >
        <option value="">Choisir un pays</option>
        <option value="Maroc">Maroc</option>
        <option value="France">France</option>
        <option value="Allemagne">Allemagne</option>
      </select>

      <label>
        <input
          type="checkbox"
          name="cgu"
          checked={form.cgu}
          onChange={handleChange}
        />
        J'accepte les CGU
      </label>

      <button type="submit" disabled={!form.cgu}>
        Envoyer
      </button>
    </form>
  );
}


export function Competences() {
  const [competences, setCompetences] = useState([
    { nom: "", niveau: "Débutant" }
  ]);

  const [resultat, setResultat] = useState(null);
  const [erreur, setErreur] = useState("");


  const handleChange = (index, e) => {
    const { name, value } = e.target;

    const nouvelleListe = [...competences];

    nouvelleListe[index][name] = value;

    setCompetences(nouvelleListe);
  };

 
  const ajouter = () => {
    setCompetences([
      ...competences,
      { nom: "", niveau: "Débutant" }
    ]);
  };

  
  const supprimer = (index) => {
    if (competences.length > 1) {
      setCompetences(
        competences.filter((_, i) => i !== index)
      );
    }
  };

  
  const handleSubmit = (e) => {
    e.preventDefault();

    const noms = competences.map((c) =>
      c.nom.trim().toLowerCase()
    );

    if (noms.some((nom) => nom === "")) {
      setErreur("Remplissez toutes les compétences");
      setResultat(null);
      return;
    }

    if (new Set(noms).size !== noms.length) {
      setErreur("Les doublons sont interdits");
      setResultat(null);
      return;
    }

    setErreur("");
    setResultat(competences);
  };

  return (
    <div>
      <h2>Mes compétences</h2>

      <form onSubmit={handleSubmit}>
        {competences.map((competence, index) => (
          <div key={index}>
            <input
              name="nom"
              placeholder="Nom de la compétence"
              value={competence.nom}
              onChange={(e) => handleChange(index, e)}
            />

            <select
              name="niveau"
              value={competence.niveau}
              onChange={(e) => handleChange(index, e)}
            >
              <option value="Débutant">Débutant</option>
              <option value="Intermédiaire">Intermédiaire</option>
              <option value="Avancé">Avancé</option>
            </select>

            <button
              type="button"
              onClick={() => supprimer(index)}
              disabled={competences.length === 1}
            >
              Supprimer
            </button>
          </div>
        ))}

        <button type="button" onClick={ajouter}>
          Ajouter une compétence
        </button>

        <button type="submit">
          Envoyer
        </button>
      </form>

      {erreur && <p>{erreur}</p>}

      {resultat && (
        <pre>
          {JSON.stringify(resultat, null, 2)}
        </pre>
      )}
    </div>
  );
}



export function MultiEtapes() {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    nom: "",
    email: "",
    adresse: "",
    ville: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const identityValid =
    form.nom.trim() !== "" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const addressValid =
    form.adresse.trim() !== "" &&
    form.ville.trim() !== "";

  const suivant = () => {
    if (step === 1 && identityValid) {
      setStep(2);
    } else if (step === 2 && addressValid) {
      setStep(3);
    }
  };

  return (
    <div>
      <h2>Inscription</h2>

      <p>Étape {step} / 3</p>

      {step === 1 && (
        <div>
          <h3>Identité</h3>

          <input
            name="nom"
            placeholder="Nom"
            value={form.nom}
            onChange={handleChange}
          />

          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <button
            onClick={suivant}
            disabled={!identityValid}
          >
            Suivant
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3>Adresse</h3>

          <input
            name="adresse"
            placeholder="Adresse"
            value={form.adresse}
            onChange={handleChange}
          />

          <input
            name="ville"
            placeholder="Ville"
            value={form.ville}
            onChange={handleChange}
          />

          <button onClick={() => setStep(1)}>
            Précédent
          </button>

          <button
            onClick={suivant}
            disabled={!addressValid}
          >
            Suivant
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3>Récapitulatif</h3>

          <h4>Identité</h4>
          <p>Nom : {form.nom}</p>
          <p>Email : {form.email}</p>

          <button onClick={() => setStep(1)}>
            Modifier
          </button>

          <h4>Adresse</h4>
          <p>Adresse : {form.adresse}</p>
          <p>Ville : {form.ville}</p>

          <button onClick={() => setStep(2)}>
            Modifier
          </button>

          <button onClick={() => alert("Inscription terminée !")}>
            Confirmer
          </button>
        </div>
      )}
    </div>
  );
}
