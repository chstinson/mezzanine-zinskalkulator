// src/components/ZinsCalculator.jsx
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from './ui/card';
import _ from 'lodash';

// Utility-Funktionen
import { formatCurrency, formatPercent, formatNumber, formatQuartal } from '../utils/formatters';
import { calculateZinsplan } from '../utils/calculations';

const ZinsCalculator = () => {
  // Haupt-State für alle Eingaben und Berechnungen
  const [state, setState] = useState({
    gesamtFinanzierung: 1000000,
    allInMezzanineZins: 5.0,
    crowdZins: 7.0,
    vermittlungsGebuehr: 3.0,
    strukturierungsGebuehr: 10000,
    vermittlungEndfaellig: false,
    strukturierungEndfaellig: false,
    anzahlTranchen: 1,
    tranchen: [
      { laufzeit: 24, gesamtFinanzierung: 1000000, allInMezzanineZins: 5.0, crowdZins: 7.0 },
    ],
    error: null
  });

  // Berechne alle Ergebnisse basierend auf dem aktuellen State
  const [results, setResults] = useState({
    tranchen: [],
    gesamt: {
      gesamtFinanzierung: 0,
      zinsplanBrutto: [],
      zinsplanNetto: [],
      gesamtZinsenBrutto: 0,
      gesamtZinsenNetto: 0
    }
  });

  // Berechnungslogik bei State-Änderungen 
  useEffect(() => {
    try {
      const calculationResults = calculateZinsplan(state);
      setResults(calculationResults);
    } catch (error) {
      setResults({
        tranchen: [],
        gesamt: {
          gesamtFinanzierung: 0,
          zinsplanBrutto: [],
          zinsplanNetto: [],
          gesamtZinsenBrutto: 0,
          gesamtZinsenNetto: 0
        },
        error: "Berechnungsfehler: " + error.message
      });
    }
  }, [state]);

  // Handler für Änderungen an den Hauptwerten
  const handleMainInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : 
                   type === 'number' ? parseFloat(value) || 0 : value;
    
    setState(prevState => ({
      ...prevState,
      [name]: newValue
    }));
  };

  // Handler für Änderungen an den Tranchen
  const handleTrancheChange = (index, field, value) => {
    setState(prevState => {
      const newTranchen = [...prevState.tranchen];
      newTranchen[index] = {
        ...newTranchen[index],
        [field]: parseFloat(value) || 0
      };
      return {
        ...prevState,
        tranchen: newTranchen
      };
    });
  };

  // Tranche hinzufügen
  const addTranche = () => {
    if (state.tranchen.length < 3) {
      setState(prevState => {
        const newTranchen = [...prevState.tranchen];
        newTranchen.push({
          laufzeit: 24,
          gesamtFinanzierung: prevState.gesamtFinanzierung,
          allInMezzanineZins: prevState.allInMezzanineZins,
          crowdZins: prevState.crowdZins
        });
        return {
          ...prevState,
          tranchen: newTranchen,
          anzahlTranchen: prevState.anzahlTranchen + 1
        };
      });
    }
  };

  // Tranche entfernen
  const removeTranche = (index) => {
    setState(prevState => {
      const newTranchen = [...prevState.tranchen];
      newTranchen.splice(index, 1);
      return {
        ...prevState,
        tranchen: newTranchen,
        anzahlTranchen: prevState.anzahlTranchen - 1
      };
    });
  };
  
  // Render-Teil
  return (
    <div className="w-full p-4 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Zinskalkulator für Mezzanine-Finanzierungen</h1>
      
      {results.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {results.error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Haupteinstellungen */}
        <Card>
          <CardHeader>
            <CardTitle>Allgemeine Einstellungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Gesamtfinanzierung (€)</label>
                <input
                  type="number"
                  name="gesamtFinanzierung"
                  value={state.gesamtFinanzierung}
                  onChange={handleMainInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">All-in Mezzanine Zins (%)</label>
                <input
                  type="number"
                  name="allInMezzanineZins"
                  value={state.allInMezzanineZins}
                  onChange={handleMainInputChange}
                  className="w-full p-2 border rounded"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Crowd Zins (%)</label>
                <input
                  type="number"
                  name="crowdZins"
                  value={state.crowdZins}
                  onChange={handleMainInputChange}
                  className="w-full p-2 border rounded"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Vermittlungsgebühr (%)</label>
                <input
                  type="number"
                  name="vermittlungsGebuehr"
                  value={state.vermittlungsGebuehr}
                  onChange={handleMainInputChange}
                  className="w-full p-2 border rounded"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Strukturierungsgebühr (€)</label>
                <input
                  type="number"
                  name="strukturierungsGebuehr"
                  value={state.strukturierungsGebuehr}
                  onChange={handleMainInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="vermittlungEndfaellig"
                    name="vermittlungEndfaellig"
                    checked={state.vermittlungEndfaellig}
                    onChange={handleMainInputChange}
                    className="mr-2"
                  />
                  <label htmlFor="vermittlungEndfaellig" className="text-sm">Vermittlung endfällig</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="strukturierungEndfaellig"
                    name="strukturierungEndfaellig"
                    checked={state.strukturierungEndfaellig}
                    onChange={handleMainInputChange}
                    className="mr-2"
                  />
                  <label htmlFor="strukturierungEndfaellig" className="text-sm">Strukturierung endfällig</label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Trancheneinstellungen */}
        <Card>
          <CardHeader>
            <CardTitle>Tranchen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {state.tranchen.map((tranche, index) => (
                <div key={index} className="p-4 border rounded bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold">Tranche {index + 1}</h3>
                    {state.tranchen.length > 1 && (
                      <button
                        onClick={() => removeTranche(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Entfernen
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Laufzeit (Monate)</label>
                      <input
                        type="number"
                        value={tranche.laufzeit}
                        onChange={(e) => handleTrancheChange(index, 'laufzeit', e.target.value)}
                        className="w-full p-2 border rounded"
                        min="1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Finanzierungssumme (€)</label>
                      <input
                        type="number"
                        value={tranche.gesamtFinanzierung}
                        onChange={(e) => handleTrancheChange(index, 'gesamtFinanzierung', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">All-in Mezzanine Zins (%)</label>
                      <input
                        type="number"
                        value={tranche.allInMezzanineZins}
                        onChange={(e) => handleTrancheChange(index, 'allInMezzanineZins', e.target.value)}
                        className="w-full p-2 border rounded"
                        step="0.1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Crowd Zins (%)</label>
                      <input
                        type="number"
                        value={tranche.crowdZins}
                        onChange={(e) => handleTrancheChange(index, 'crowdZins', e.target.value)}
                        className="w-full p-2 border rounded"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {state.tranchen.length < 3 && (
                <button
                  onClick={addTranche}
                  className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Weitere Tranche hinzufügen
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Ergebnisse */}
      <h2 className="text-xl font-bold mb-4">Ergebnisse</h2>
      
      {/* Einzelne Tranchen */}
      {results.tranchen.map((tranche, index) => (
        <Card key={index} className="mb-6">
          <CardHeader>
            <CardTitle>Tranche {index + 1} - Laufzeit: {tranche.laufzeitMonate} Monate ({(tranche.laufzeitJahre).toFixed(1)} Jahre)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {tranche.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {tranche.error}
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2">Komponente</th>
                      <th className="border p-2">Per Annum</th>
                      <th className="border p-2">Gesamt (Netto)</th>
                      <th className="border p-2">Gesamt (Brutto)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2 font-medium">Gesamtfinanzierung</td>
                      <td className="border p-2">-</td>
                      <td className="border p-2">{formatCurrency(tranche.gesamtFinanzierung)}</td>
                      <td className="border p-2">-</td>
                    </tr>
                    <tr>
                      <td className="border p-2">All-in Mezzanine Zins ({formatPercent(tranche.allInMezzanineZins)})</td>
                      <td className="border p-2">{formatCurrency(tranche.gesamtFinanzierung * tranche.allInMezzanineZins / 100)}</td>
                      <td className="border p-2">{formatCurrency(tranche.gesamtFinanzierung * tranche.allInMezzanineZins / 100 * tranche.laufzeitJahre)}</td>
                      <td className="border p-2">-</td>
                    </tr>
                    <tr>
                      <td className="border p-2">Crowd Zins ({formatPercent(tranche.crowdZins)})</td>
                      <td className="border p-2">{formatCurrency(tranche.gesamtFinanzierung * tranche.crowdZins / 100)}</td>
                      <td className="border p-2">{formatCurrency(tranche.gesamtFinanzierung * tranche.crowdZins / 100 * tranche.laufzeitJahre)}</td>
                      <td className="border p-2">{formatCurrency(tranche.gesamtFinanzierung * tranche.crowdZins / 100 * tranche.laufzeitJahre)}</td>
                    </tr>
                    <tr>
                      <td className="border p-2">Vermittlungsgebühr ({formatPercent(state.vermittlungsGebuehr)})</td>
                      <td className="border p-2">{formatCurrency(tranche.vermittlungsGebuehrBetrag / tranche.laufzeitJahre)}</td>
                      <td className="border p-2">{formatCurrency(tranche.vermittlungsGebuehrBetrag)}</td>
                      <td className="border p-2">{formatCurrency(tranche.vermittlungsGebuehrBetrag * 1.19)}</td>
                    </tr>
                    <tr>
                      <td className="border p-2">Strukturierungsgebühr</td>
                      <td className="border p-2">{formatCurrency(tranche.strukturierungsGebuehrBetrag / tranche.laufzeitJahre)}</td>
                      <td className="border p-2">{formatCurrency(tranche.strukturierungsGebuehrBetrag)}</td>
                      <td className="border p-2">{formatCurrency(tranche.strukturierungsGebuehrBetrag * 1.19)}</td>
                    </tr>
                    <tr>
                      <td className="border p-2">Servicegebühr</td>
                      <td className="border p-2">{formatCurrency(tranche.serviceGebuehrJahr)}</td>
                      <td className="border p-2">{formatCurrency(tranche.serviceGebuehrJahr * tranche.laufzeitJahre)}</td>
                      <td className="border p-2">{formatCurrency(tranche.serviceGebuehrJahr * tranche.laufzeitJahre * 1.19)}</td>
                    </tr>
                    <tr className="bg-gray-100 font-bold">
                      <td className="border p-2">Summe</td>
                      <td className="border p-2">{formatCurrency(tranche.perAnnumNetto)}</td>
                      <td className="border p-2">{formatCurrency(tranche.gesamtNetto)}</td>
                      <td className="border p-2">{formatCurrency(tranche.gesamtBrutto)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Zahlplan */}
              <h3 className="font-semibold mt-4 mb-2">Zahlplan</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2">Zeitpunkt</th>
                      <th className="border p-2">Vermittlung</th>
                      <th className="border p-2">Strukturierung</th>
                      <th className="border p-2">Crowd Zinsen</th>
                      <th className="border p-2">Servicegebühr</th>
                      <th className="border p-2">Gesamt Netto</th>
                      <th className="border p-2">MwSt</th>
                      <th className="border p-2">Gesamt Brutto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tranche.zahlplan.map((zahlung, zIndex) => {
                      const gesamtNetto = zahlung.vermittlungsGebuehr + zahlung.strukturierungsGebuehr + 
                                          zahlung.crowdZins + zahlung.serviceGebuehr;
                      const gesamtMwSt = zahlung.vermittlungsGebuehrMwSt + zahlung.strukturierungsGebuehrMwSt + 
                                         zahlung.serviceGebuehrMwSt;
                      const gesamtBrutto = gesamtNetto + gesamtMwSt;
                      
                      return (
                        <tr key={zIndex}>
                          <td className="border p-2">{formatQuartal(zahlung.zeitpunkt)}</td>
                          <td className="border p-2">{formatCurrency(zahlung.vermittlungsGebuehr)}</td>
                          <td className="border p-2">{formatCurrency(zahlung.strukturierungsGebuehr)}</td>
                          <td className="border p-2">{formatCurrency(zahlung.crowdZins)}</td>
                          <td className="border p-2">{formatCurrency(zahlung.serviceGebuehr)}</td>
                          <td className="border p-2">{formatCurrency(gesamtNetto)}</td>
                          <td className="border p-2">{formatCurrency(gesamtMwSt)}</td>
                          <td className="border p-2">{formatCurrency(gesamtBrutto)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Gesamtergebnis */}
      {results.tranchen.length > 1 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Gesamtergebnis aller Tranchen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2">Komponente</th>
                      <th className="border p-2">Wert</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2 font-medium">Gesamtfinanzierung</td>
                      <td className="border p-2">{formatCurrency(results.gesamt.gesamtFinanzierung)}</td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-medium">Gesamtzinsen (Netto)</td>
                      <td className="border p-2">{formatCurrency(results.gesamt.gesamtZinsenNetto)}</td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-medium">Gesamtzinsen (Brutto)</td>
                      <td className="border p-2">{formatCurrency(results.gesamt.gesamtZinsenBrutto)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ZinsCalculator;
