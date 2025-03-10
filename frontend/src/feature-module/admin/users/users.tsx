import React, { useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Link } from 'react-router-dom';
import * as Icon from 'react-feather';
import axios from 'axios';
import UsersModal from '../common/modals/users-modal';

const Users = () => {
  const [users, setUsers] = useState([]); // Liste complète des utilisateurs
  const [filteredUsers, setFilteredUsers] = useState([]); // Liste filtrée
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<string>('All'); // Lettre sélectionnée
  const [searchQuery, setSearchQuery] = useState<string>(''); // Recherche
  const [roleFilter, setRoleFilter] = useState<string | null>(null); // Filtre par rôle
  const [userToDelete, setUserToDelete] = useState<any>(null); // Utilisateur à supprimer
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // Erreurs de validation

  const alphabet = ['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  // Charger les utilisateurs depuis l'API
  useEffect(() => {
    axios.get('http://localhost:4000/api/users')
      .then((response) => {
        setUsers(response.data);
        setFilteredUsers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        setLoading(false);
      });
  }, []);

  // Filtrer les utilisateurs par lettre
  const filterByLetter = (letter: string) => {
    setSelectedLetter(letter);
    applyFilters(searchQuery, letter, roleFilter);
  };

  // Filtrer les utilisateurs par recherche
  const filterBySearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, selectedLetter, roleFilter);
  };

  // Filtrer par rôle (Admin/User)
  const filterByRole = (role: string) => {
    setRoleFilter(role === roleFilter ? null : role);
    applyFilters(searchQuery, selectedLetter, role === roleFilter ? null : role);
  };

  // Appliquer tous les filtres
  const applyFilters = (query: string, letter: string, role: string | null) => {
    let filtered = [...users];

    if (letter !== 'All') {
      filtered = filtered.filter((user: any) =>
        user.firstname?.charAt(0).toUpperCase() === letter
      );
    }

    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter((user: any) =>
        user.firstname.toLowerCase().includes(lowerQuery) ||
        user.lastname.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery) ||
        user.role.toLowerCase().includes(lowerQuery) ||
        user.phone.includes(query)
      );
    }

    if (role) {
      filtered = filtered.filter((user: any) => user.role.toLowerCase() === role.toLowerCase());
    }

    setFilteredUsers(filtered);
  };

  // Fonction de suppression avec popup de confirmation
  const confirmDeleteUser = (user: any) => {
    setUserToDelete(user);
  };

  const deleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await axios.delete(`http://localhost:4000/api/users/${userToDelete._id}`);
      const updatedUsers = users.filter((user) => user._id !== userToDelete._id);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      setUserToDelete(null);
      alert("Utilisateur supprimé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      alert("Erreur lors de la suppression de l'utilisateur");
    }
  };

  // Valider les données du formulaire
  const validateForm = (data: any) => {
    const errors: { [key: string]: string } = {};

    if (!data.firstname || data.firstname.length < 2 || data.firstname.length > 50) {
      errors.firstname = "Le prénom doit contenir entre 2 et 50 caractères.";
    }

    if (!data.lastname || data.lastname.length < 2 || data.lastname.length > 50) {
      errors.lastname = "Le nom doit contenir entre 2 et 50 caractères.";
    }

    if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
      errors.email = "Veuillez fournir une adresse email valide.";
    }

    if (data.authUser === "local" && (!data.phone || !/^(2|5|9)\d{7}$/.test(data.phone))) {
      errors.phone = "Veuillez fournir un numéro de téléphone tunisien valide.";
    }

    if (data.authUser === "local" && (!data.password || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(data.password))) {
      errors.password = "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.";
    }

    return errors;
  };

  // Boutons d'action pour chaque utilisateur
  const actionButton = (user: any) => {
    return (
      <div className="table-actions d-flex">
        <Link className="delete-table me-2" to="#" data-bs-toggle="modal" data-bs-target="#edit-user">
          <Icon.Edit className="react-feather-custom" />
        </Link>
        <Link className="delete-table" to="#" onClick={() => confirmDeleteUser(user)}>
          <Icon.Trash2 className="react-feather-custom" />
        </Link>
      </div>
    );
  };

  return (
    <>
      <div className="page-wrapper page-settings">
        <div className="content">
          <div className="content-page-header content-page-headersplit">
            <h5>Users</h5>
            <div className="list-btn">
              <ul>
                {/* Barre de recherche */}
                <li>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => filterBySearch(e.target.value)}
                  />
                </li>

                {/* Bouton Filtre */}
                <li>
                  <div className="filter-sorting d-flex align-items-center">
                    <Icon.Filter className="react-feather-custom me-2" />
                    <label className="me-2">Filtre:</label>
                    <select
                      className="form-select"
                      value={selectedLetter}
                      onChange={(e) => filterByLetter(e.target.value)}
                    >
                      {alphabet.map((letter) => (
                        <option key={letter} value={letter}>
                          {letter}
                        </option>
                      ))}
                    </select>
                  </div>
                </li>

                {/* Filtres par rôle */}
                <li>
                  <label className="me-2">
                    <input
                      type="checkbox"
                      checked={roleFilter === 'admin'}
                      onChange={() => filterByRole('admin')}
                    />
                    Admin
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={roleFilter === 'user'}
                      onChange={() => filterByRole('user')}
                    />
                    User
                  </label>
                </li>

                {/* Bouton Ajouter */}
                <li>
                  <button className="btn btn-primary" type="button" data-bs-toggle="modal" data-bs-target="#add-user">
                    <i className="fa fa-plus me-2" />
                    Add User
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Tableau des utilisateurs */}
          <div className="row">
            <div className="col-12">
              <div className="table-responsive">
                <DataTable value={filteredUsers} showGridlines tableStyle={{ minWidth: '50rem' }} loading={loading}>
                  <Column sortable field="firstname" header="Firstname" />
                  <Column sortable field="lastname" header="Lastname" />
                  <Column sortable field="email" header="Email" />
                  <Column sortable field="role" header="Role" />
                  <Column sortable field="phone" header="Phone" />
                  <Column field="action" header="Action" body={actionButton} />
                </DataTable>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal pour ajouter ou éditer un utilisateur */}
      <UsersModal />

      {/* Popup de confirmation avant suppression */}
      {userToDelete && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmation</h5>
              </div>
              <div className="modal-body">
                <p>Voulez-vous vraiment supprimer {userToDelete.firstname} {userToDelete.lastname} ?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-danger" onClick={deleteUser}>Oui, supprimer</button>
                <button className="btn btn-secondary" onClick={() => setUserToDelete(null)}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Users;