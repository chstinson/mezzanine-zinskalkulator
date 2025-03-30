// calculations.js
import _ from 'lodash';

/**
 * Berechnet den Zinsplan für die gegebenen Parameter
 * @param {Object} state - Der aktuelle State des Zinskalkulators
 * @returns {Object} - Die berechneten Ergebnisse
 */
export const calculateZinsplan = (state) => {
  // Berechnung für jede Tranche
  const berechneteTranchen = state.tranchen.map((tranche, index) => {
    const laufzeitMonate = tranche.laufzeit;
    const laufzeitJahre = laufzeitMonate / 12;
    const gesamtFinanzierung = tranche.gesamtFinanzierung || state.gesamtFinanzierung;
    const allInMezzanineZins = tranche.allInMezzanineZins || state.allInMezzanineZins;
    const crowdZins = tranche.crowdZins || state.crowdZins;
    
    // Gebühren
    const vermittlungsGebuehrBetrag = (state.vermittlungsGebuehr / 100) * gesamtFinanzierung;
    const strukturierungsGebuehrBetrag = state.strukturierungsGebuehr;
    
    // Zinsen pro Jahr berechnen
    const crowdZinsenJahr = (crowdZins / 100) * gesamtFinanzierung;
    const allInMezzanineZinsenJahr = (allInMezzanineZins / 100) * gesamtFinanzierung;
    
    // Servicegebühr berechnen (verbleibender Betrag)
    const einmaligeGebuehrenProJahr = (vermittlungsGebuehrBetrag + strukturierungsGebuehrBetrag) / laufzeitJahre;
    const serviceGebuehrJahr = allInMezzanineZinsenJahr - crowdZinsenJahr - einmaligeGebuehrenProJahr;
    
    // Prüfen, ob Servicegebühr positiv ist
    let error = null;
    if (serviceGebuehrJahr < 0) {
      error = `Achtung: Die Servicegebühr für Tranche ${index + 1} ist negativ. Bitte passen Sie die Gebühren oder den All-in-Mezzanine-Zins an.`;
    }
    
    // Zahlplan berechnen
    const zahlplan = berechneTranchenzahlplan(
      laufzeitMonate, 
      vermittlungsGebuehrBetrag, 
      strukturierungsGebuehrBetrag,
      crowdZinsenJahr,
      serviceGebuehrJahr,
      state.vermittlungEndfaellig,
      state.strukturierungEndfaellig
    );
    
    // Gesamtbeträge berechnen
    const gesamtVermittlungsGebuehr = _.sumBy(zahlplan, 'vermittlungsGebuehr');
    const gesamtStrukturierungsGebuehr = _.sumBy(zahlplan, 'strukturierungsGebuehr');
    const gesamtCrowdZinsen = _.sumBy(zahlplan, 'crowdZins');
    const gesamtServiceGebuehr = _.sumBy(zahlplan, 'serviceGebuehr');
    
    // MwSt-Beträge
    const gesamtVermittlungsGebuehrMwSt = _.sumBy(zahlplan, 'vermittlungsGebuehrMwSt');
    const gesamtStrukturierungsGebuehrMwSt = _.sumBy(zahlplan, 'strukturierungsGebuehrMwSt');
    const gesamtServiceGebuehrMwSt = _.sumBy(zahlplan, 'serviceGebuehrMwSt');
    
    // Gesamt Netto & Brutto
    const gesamtNetto = gesamtVermittlungsGebuehr + gesamtStrukturierungsGebuehr + gesamtCrowdZinsen + gesamtServiceGebuehr;
    const gesamtBrutto = gesamtNetto + gesamtVermittlungsGebuehrMwSt + gesamtStrukturierungsGebuehrMwSt + gesamtServiceGebuehrMwSt;
    
    // Pro Jahr Beträge
    const perAnnumNetto = gesamtNetto / laufzeitJahre;
    const perAnnumBrutto = gesamtBrutto / laufzeitJahre;

    return {
      index,
      laufzeitMonate,
      laufzeitJahre,
      gesamtFinanzierung,
      allInMezzanineZins,
      crowdZins,
      vermittlungsGebuehrBetrag,
      strukturierungsGebuehrBetrag,
      serviceGebuehrJahr,
      zahlplan,
      perAnnumNetto,
      perAnnumBrutto,
      gesamtNetto,
      gesamtBrutto,
      error
    };
  });
  
  // Gesamtergebnis über alle Tranchen
  const gesamtFinanzierung = _.sumBy(berechneteTranchen, 'gesamtFinanzierung');
  const gesamtZinsenNetto = _.sumBy(berechneteTranchen, 'gesamtNetto');
  const gesamtZinsenBrutto = _.sumBy(berechneteTranchen, 'gesamtBrutto');
  
  // Kombinierter Zahlplan für alle Tranchen
  const kombinierterZahlplan = berechnekombiniertenZahlplan(berechneteTranchen);
  
  // Fehler sammeln
  const fehler = berechneteTranchen
    .filter(t => t.error)
    .map(t => t.error);
  
  return {
    tranchen: berechneteTranchen,
    gesamt: {
      gesamtFinanzierung,
      zinsplanBrutto: kombinierterZahlplan,
      zinsplanNetto: kombinierterZahlplan,
      gesamtZinsenBrutto,
      gesamtZinsenNetto
    },
    error: fehler.length > 0 ? fehler.join(' ') : null
  };
};

/**
 * Berechnet den Zahlplan für eine Tranche
 */
function berechneTranchenzahlplan(
  laufzeitMonate, 
  vermittlungsGebuehrBetrag, 
  strukturierungsGebuehrBetrag,
  crowdZinsenJahr,
  serviceGebuehrJahr,
  vermittlungEndfaellig,
  strukturierungEndfaellig
) {
  const zahlplan = [];
  
  // Einmalige Gebühren zu Beginn, wenn nicht endfällig
  if (!vermittlungEndfaellig) {
    zahlplan.push({
      zeitpunkt: 0,
      vermittlungsGebuehr: vermittlungsGebuehrBetrag,
      vermittlungsGebuehrMwSt: vermittlungsGebuehrBetrag * 0.19,
      strukturierungsGebuehr: !strukturierungEndfaellig ? strukturierungsGebuehrBetrag : 0,
      strukturierungsGebuehrMwSt: !strukturierungEndfaellig ? strukturierungsGebuehrBetrag * 0.19 : 0,
      crowdZins: 0,
      serviceGebuehr: 0,
      serviceGebuehrMwSt: 0
    });
  }
  
  // Quartalsweise Zahlungen
  for (let monat = 3; monat <= laufzeitMonate; monat += 3) {
    zahlplan.push({
      zeitpunkt: monat,
      vermittlungsGebuehr: 0,
      vermittlungsGebuehrMwSt: 0,
      strukturierungsGebuehr: 0,
      strukturierungsGebuehrMwSt: 0,
      crowdZins: crowdZinsenJahr / 4,
      serviceGebuehr: serviceGebuehrJahr / 4,
      serviceGebuehrMwSt: (serviceGebuehrJahr / 4) * 0.19
    });
  }
  
  // Endfällige Gebühren
  if (vermittlungEndfaellig || strukturierungEndfaellig) {
    const letzterEintrag = {
      zeitpunkt: laufzeitMonate,
      vermittlungsGebuehr: vermittlungEndfaellig ? vermittlungsGebuehrB
