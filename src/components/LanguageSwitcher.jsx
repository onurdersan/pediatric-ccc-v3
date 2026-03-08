import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="ccc-lang-switcher" style={{ display: 'flex', gap: '8px', zIndex: 10 }}>
            <button
                onClick={() => changeLanguage('tr')}
                style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    background: i18n.language.startsWith('tr') ? '#0070f3' : '#fff',
                    color: i18n.language.startsWith('tr') ? '#fff' : '#333',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600
                }}
            >
                TR
            </button>
            <button
                onClick={() => changeLanguage('en')}
                style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    background: i18n.language.startsWith('en') ? '#0070f3' : '#fff',
                    color: i18n.language.startsWith('en') ? '#fff' : '#333',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600
                }}
            >
                EN
            </button>
        </div>
    );
}
