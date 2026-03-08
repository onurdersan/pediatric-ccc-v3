import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ManualClassifier from './components/ManualClassifier.jsx';
import BatchUploader from './components/BatchUploader.jsx';
import LanguageSwitcher from './components/LanguageSwitcher.jsx';

export default function App() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('manual');

    const TABS = [
        { id: 'manual', label: t('app.tab.manual'), icon: '🔍' },
        { id: 'batch', label: t('app.tab.batch'), icon: '📊' },
    ];

    return (
        <div className="ccc-app">
            {/* Header */}
            <header className="ccc-header">
                <div className="ccc-header-inner">
                    <div className="ccc-logo-area">
                        <div className="ccc-logo-icon">CCC</div>
                        <div>
                            <h1 className="ccc-title">{t('app.title')}</h1>
                            <p className="ccc-subtitle">{t('app.subtitle')}</p>
                        </div>
                    </div>
                    <div>
                        <LanguageSwitcher />
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <nav className="ccc-nav">
                <div className="ccc-nav-inner">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            className={`ccc-tab ${activeTab === tab.id ? 'ccc-tab--active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                            aria-selected={activeTab === tab.id}
                            role="tab"
                        >
                            <span className="ccc-tab-icon">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Main Content */}
            <main className="ccc-main">
                <div className="ccc-container">
                    {activeTab === 'manual' && <ManualClassifier />}
                    {activeTab === 'batch' && <BatchUploader />}
                </div>
            </main>

            {/* Footer */}
            <footer className="ccc-footer">
                <p>
                    Feinstein JA, Hall M, Davidson A, Feudtner C. Pediatric Complex Chronic Condition System Version 3.
                    <em> JAMA Netw Open.</em> 2024;7(7):e2420579. <a href="https://doi.org/10.1001/jamanetworkopen.2024.20579">10.1001/jamanetworkopen.2024.20579</a>
                </p>
                <p className="ccc-footer-note">
                    {t('app.footer.note')}
                </p>
            </footer>
        </div>
    );
}
