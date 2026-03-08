/**
 * ResultsTable — Displays CCC v3 classification results
 * 
 * Shows 10 body-system categories with their tech-dependency status.
 * Uses both color AND text labels (accessibility requirement).
 */

import { useTranslation } from 'react-i18next';

// Category display configuration
const CATEGORY_KEYS = [
    { key: 'cvd', tKey: 'cat.cardio', icon: '❤️' },
    { key: 'resp', tKey: 'cat.resp', icon: '🫁' },
    { key: 'neuromusc', tKey: 'cat.neuro', icon: '🧠' },
    { key: 'renal', tKey: 'cat.renal', icon: '🫘' },
    { key: 'gi', tKey: 'cat.gastro', icon: '🔬' },
    { key: 'hemato_immuno', tKey: 'cat.hemato', icon: '🩸' },
    { key: 'metabolic', tKey: 'cat.metabolic', icon: '⚗️' },
    { key: 'congeni_genetic', tKey: 'cat.cong', icon: '🧬' },
    { key: 'malignancy', tKey: 'cat.malignancy', icon: '🔴' },
    { key: 'neonatal', tKey: 'cat.necro', icon: '👶' },
];

export default function ResultsTable({ result }) {
    const { t } = useTranslation();
    if (!result) return null;

    const activeCount = result.num_categories || 0;
    const hasCCC = result.ccc_flag === 1;

    return (
        <div className="ccc-results">
            {/* Summary Badge */}
            <div className={`ccc-summary ${hasCCC ? 'ccc-summary--positive' : 'ccc-summary--negative'}`}>
                <div className="ccc-summary-status">
                    <span className="ccc-summary-label">{t('results.summary')}</span>
                    <span className="ccc-summary-value">
                        {hasCCC ? t('results.summary.ccc') : t('results.summary.noccc')}
                    </span>
                </div>
                <div className="ccc-summary-count">
                    <span className="ccc-summary-label">{t('results.table.category')}</span>
                    <span className="ccc-summary-number">{activeCount}</span>
                </div>
            </div>

            {/* Category Grid */}
            <div className="ccc-category-grid">
                {CATEGORY_KEYS.map(cat => {
                    const isActive = result[cat.key] === 1;
                    const hasTech = result[`${cat.key}_tech`] === 1;

                    return (
                        <div
                            key={cat.key}
                            className={`ccc-category-card ${isActive ? 'ccc-category-card--active' : ''}`}
                        >
                            <div className="ccc-category-header">
                                <span className="ccc-category-icon">{cat.icon}</span>
                                <span className="ccc-category-name">{t(cat.tKey)}</span>
                            </div>
                            <div className="ccc-category-status">
                                <span className={`ccc-badge ${isActive ? 'ccc-badge--positive' : 'ccc-badge--negative'}`}>
                                    {isActive ? t('results.table.yes') : t('results.table.no')}
                                </span>
                                {isActive && (
                                    <span className={`ccc-tech-badge ${hasTech ? 'ccc-tech-badge--active' : ''}`}>
                                        {hasTech ? `⚡ ${t('results.summary.tech')}` : t('results.summary.notech')}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
