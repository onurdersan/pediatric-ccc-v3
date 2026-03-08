import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ResultsTable from './ResultsTable.jsx';
import SearchableCodeSelect from './SearchableCodeSelect.jsx';
import dxMap from '../data/dx_map.json';
import pxMap from '../data/px_map.json';

export default function ManualClassifier() {
    const { t, i18n } = useTranslation();
    const [selectedDxCodes, setSelectedDxCodes] = useState([]);
    const [selectedPxCodes, setSelectedPxCodes] = useState([]);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Category labels for display in dropdown
    const categoryLabels = useMemo(() => ({
        cvd: t('cat.cardio'),
        respiratory: t('cat.resp'),
        neuromusc: t('cat.neuro'),
        renal: t('cat.renal'),
        gastro: t('cat.gastro'),
        hemato_immuno: t('cat.hemato'),
        metabolic: t('cat.metabolic'),
        congeni_genetic: t('cat.cong'),
        malignancy: t('cat.malignancy'),
        neonatal: t('cat.necro'),
    }), [t]);

    const handleClassify = useCallback(async () => {
        setError('');
        setResult(null);

        if (selectedDxCodes.length === 0 && selectedPxCodes.length === 0) {
            setResult(null);
            setError('');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/classify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dx_codes: selectedDxCodes, px_codes: selectedPxCodes }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || t('batch.error'));
                return;
            }

            setResult(data.result);
        } catch (err) {
            setError(t('batch.error'));
        } finally {
            setLoading(false);
        }
    }, [selectedDxCodes, selectedPxCodes, t]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (selectedDxCodes.length > 0 || selectedPxCodes.length > 0) {
                handleClassify();
            } else {
                setResult(null);
                setError('');
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [selectedDxCodes, selectedPxCodes, handleClassify]);

    const handleClear = useCallback(() => {
        setSelectedDxCodes([]);
        setSelectedPxCodes([]);
        setResult(null);
        setError('');
    }, []);

    return (
        <div className="ccc-manual">
            <div className="ccc-manual-description">
                <h2>{t('manual.title')}</h2>
                <p>
                    {t('manual.description')}
                </p>
            </div>

            <div className="ccc-manual-content">
                <div className="ccc-manual-left">
                    <div className="ccc-input-grid">
                        {/* Dx Code Select */}
                        <SearchableCodeSelect
                            id="dx-codes"
                            codeMap={dxMap}
                            selectedCodes={selectedDxCodes}
                            onChange={setSelectedDxCodes}
                            label={t('manual.dx.label')}
                            placeholder={t('manual.dx.search')}
                            noResultsText={t('manual.code.noResults')}
                            selectedText={t('manual.code.selected')}
                            language={i18n.language}
                        />

                        {/* Px Code Select */}
                        <SearchableCodeSelect
                            id="px-codes"
                            codeMap={pxMap}
                            selectedCodes={selectedPxCodes}
                            onChange={setSelectedPxCodes}
                            label={t('manual.px.label')}
                            placeholder={t('manual.px.search')}
                            noResultsText={t('manual.code.noResults')}
                            selectedText={t('manual.code.selected')}
                            language={i18n.language}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="ccc-actions">
                        <button
                            className="ccc-btn ccc-btn--secondary"
                            onClick={handleClear}
                            disabled={loading || (selectedDxCodes.length === 0 && selectedPxCodes.length === 0)}
                        >
                            {t('manual.button.clear')}
                        </button>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="ccc-error" role="alert">
                            <strong>{error}</strong>
                        </div>
                    )}
                </div>

                <div className="ccc-manual-right">
                    {/* Results */}
                    {result ? (
                        <div className="ccc-results-section">
                            <h3>{t('results.title')}</h3>
                            <ResultsTable result={result} />
                        </div>
                    ) : (
                        <div className="ccc-results-empty">
                            {t('results.empty', 'Sonuçları görmek için sol alana kodları girin veya yapıştırın...')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
