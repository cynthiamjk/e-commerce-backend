const { json } = require("express");
const utilisateur = require("../models/utilisateur");
const utilisateurDao = require("../dao/utilisateur.dao");
const commandeDao = require('../dao/commande.dao');
const ligneCommandeDao = require('../dao/ligneCommande.dao');
const commande = require("../models/commande");
const ligneCommande = require("../models/ligneCommande");
const ligneProduitCommandeDao = require('../dao/ligneProduitCommande.dao');
const articleDao = require('../dao/article.dao');



exports.commander = async (req, res, next) => {

    const c = new commande.Commande(
        req.body.numCommande,
        req.body.dateCommande,
        req.body.idUtilisateur,
        req.body.prixTotalCommande,
        req.body.lignesCommande,
        req.body.numFacture, 
       
    );
    console.log(c.idUtilisateur)

    let com = await commandeDao.add(c)
    .catch(err => {
        return res.status(500).json({
            error :`Problème de validation de la commande ${err}`
        });
        
    });
    
    c.numCommande = com.insertId;
   
    for ( let lc of c.lignesCommande) {  
        
        let prixArticle = await articleDao.getPrixByReference(lc.referenceArticle)
        .catch(err => {
            return res.status(500).json({
                error :`Problème d'ajout de ligne commande  `
            });
        });
        let resultat = await ligneCommandeDao.addLigneCommande(lc)
        .catch(err => {
            return res.status(500).json({
                error :`Problème d'ajout de ligne commande  `
            });
        });
        lc.id = resultat.insertId;
    
    
        await ligneProduitCommandeDao.add(lc.id, c.numCommande)
        .catch(err => {
            return res.status(500).json({
                error :`Problème lors de la commande ${err}`
            });
        });
    }
    
   
  return res.status(200).json(c);
    
}