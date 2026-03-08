import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation strings
const resources = {
    tr: {
        translation: {
            // Header
            "app.title": "Pediatrik CCC-v3 Sınıflandırıcı",
            "app.subtitle": "Kompleks Kronik Durumlar — ICD-10-CM Sınıflandırma Aracı",
            "app.tab.manual": "Manuel Mod",
            "app.tab.batch": "Toplu İşlem",
            "app.footer.note": "Bu araç klinik karar desteği sağlamaz. Yalnızca araştırma amaçlıdır. Hasta verileri sunucuda saklanmaz.",

            // Manual Classifier
            "manual.title": "Tanı (Dx) ve Prosedür (Px) Kodlarını Girin",
            "manual.description": "ICD-10-CM tanı ve prosedür kodlarını virgülle ayrılarak girin (Örn: Q21.0,K51.0). Kodları noktalı veya noktasız şekilde girebilirsiniz (Örn: Q21.0 veya Q210)",
            "manual.dx.label": "Tanı Kodları (Dx)",
            "manual.dx.placeholder": "Örn: J45901, Q21.0, E84.9",
            "manual.px.label": "Prosedür Kodları (Px)",
            "manual.px.placeholder": "Örn: 0210093, 0B110F4",
            "manual.button.classify": "Sınıflandır",
            "manual.button.classifying": "Sınıflandırılıyor...",
            "manual.button.clear": "Temizle",
            "manual.error.validation": "Lütfen en az bir geçerli tanı (Dx) kodu girin.",
            "manual.dx.search": "Dx kodu arayın... (örn: Q21, E84)",
            "manual.px.search": "Px kodu arayın... (örn: 0210, 0B11)",
            "manual.code.selected": "{count} kod seçildi",
            "manual.code.noResults": "Sonuç bulunamadı",

            // Batch Uploader
            "batch.title": "Toplu İşlem (CSV / Excel Yükleme)",
            "batch.description.1": "Birden fazla kaydı aynı anda analiz etmek için CSV veya Excel dosyası yükleyin.",
            "batch.description.2": "Tüm işlemler yerel makinenizde yapılır. Hasta verileri sunucuda saklanmaz.",
            "batch.requirements.title": "Dosya Gereksinimleri:",
            "batch.req.id": "id: Hastayı veya kaydı tanımlayan benzersiz kimlik",
            "batch.req.dx": "dx: Her hastanın tanı kodları, boşluk veya virgülle ayrılmış şekilde",
            "batch.req.px": "px: Her hastanın prosedür kodları, boşluk veya virgülle ayrılmış şekilde (isteğe bağlı)",
            "batch.downloadTemplate": "Örnek CSV İndir",
            "batch.dropzone.drag": "CSV veya Excel dosyasını buraya sürükleyin",
            "batch.dropzone.select": "veya seçmek için tıklayın",
            "batch.dropzone.ariaLabel": "CSV veya Excel dosyası yükleme alanı",
            "batch.processing": "İşleniyor...",
            "batch.success": "{{count}} kayıt başarıyla tamamlandı",
            "batch.error": "Hata oluştu",
            "batch.error.size": "Dosya boyutu çok büyük. Maksimum 50MB desteklenmektedir.",
            "batch.button.download": "Sonuçları İndir (CSV)",
            "batch.button.new": "Yeni Dosya Yükle",
            "batch.error.noRecords": "Dosyada geçerli kayıt bulunamadı veya format hatalı.",
            "batch.error.format": "Dosya format hatası: Lütfen desteklenen formatlarda (CSV, XLSX, XLS) ve dx sütunu içeren bir dosya yükleyin.",

            // Results
            "results.title": "Sınıflandırma Sonucu",
            "results.empty": "Sonuçları sağ tarafta görmek için sol alana kodları girin veya yapıştırın...",
            "results.summary": "Genel Durum:",
            "results.summary.ccc": "CCC Saptandı",
            "results.summary.noccc": "CCC Saptanmadı",
            "results.summary.tech": "Teknoloji Bağımlılığı Var",
            "results.summary.notech": "Teknoloji Bağımlılığı Yok",
            "results.table.code": "Kod",
            "results.table.type": "Tip",
            "results.table.description": "Açıklama",
            "results.table.category": "Kategori",
            "results.table.tech": "Teknoloji Bağımlılığı",
            "results.table.yes": "Evet",
            "results.table.no": "Hayır",
            "results.table.match.none": "Eşleşme Bulunamadı",
            "results.table.match.nodx": "Geçerli Tanı Kodu Yok",

            // Categories
            "cat.cardio": "Kardiyovasküler",
            "cat.resp": "Solunum",
            "cat.gastro": "Gastrointestinal",
            "cat.neuro": "Nöromüsküler",
            "cat.necro": "Neonatal",
            "cat.renal": "Renal",
            "cat.hemato": "Hematolojik",
            "cat.metabolic": "Metabolik",
            "cat.cong": "Konjenital",
            "cat.malignancy": "Malignite"
        }
    },
    en: {
        translation: {
            // Header
            "app.title": "Pediatric CCC-v3 Classifier",
            "app.subtitle": "Complex Chronic Conditions — ICD-10-CM Classification Tool",
            "app.tab.manual": "Manual Mode",
            "app.tab.batch": "Batch Process",
            "app.footer.note": "This tool does not provide clinical decision support. For research purposes only. Patient data is not stored on the server.",

            // Manual Classifier
            "manual.title": "Enter Diagnosis (Dx) and Procedure (Px) Codes",
            "manual.description": "Enter ICD-10-CM Dx and Px codes separated by commas (e.g., Q21.0,K51.0). Dx/Px codes can be entered with or without dots (e.g., Q21.0 or Q210).",
            "manual.dx.label": "Diagnosis Codes (Dx)",
            "manual.dx.placeholder": "E.g. J45901, Q210, E849",
            "manual.px.label": "Procedure Codes (Px)",
            "manual.px.placeholder": "E.g. 0210093, 0B110F4",
            "manual.button.classify": "Classify",
            "manual.button.classifying": "Classifying...",
            "manual.button.clear": "Clear",
            "manual.error.validation": "Please enter at least one valid diagnosis (Dx) code.",
            "manual.dx.search": "Search Dx codes... (e.g. Q21, E84)",
            "manual.px.search": "Search Px codes... (e.g. 0210, 0B11)",
            "manual.code.selected": "{count} codes selected",
            "manual.code.noResults": "No results found",

            // Batch Uploader
            "batch.title": "Batch Process (CSV / Excel Upload)",
            "batch.description.1": "Upload a CSV or Excel file to analyze multiple records simultaneously.",
            "batch.description.2": "All processing is done locally. Patient data is not stored on the server.",
            "batch.requirements.title": "File Requirements:",
            "batch.req.id": "id: Unique identifier for the patient or record",
            "batch.req.dx": "dx: Diagnosis codes for each patient, separated by spaces or commas",
            "batch.req.px": "px: Procedure codes for each patient, separated by spaces or commas (optional)",
            "batch.downloadTemplate": "Download Sample CSV",
            "batch.dropzone.drag": "Drag and drop CSV or Excel file here",
            "batch.dropzone.select": "or click to select",
            "batch.dropzone.ariaLabel": "CSV or Excel file upload area",
            "batch.processing": "Processing...",
            "batch.success": "{{count}} records successfully processed",
            "batch.error": "An error occurred",
            "batch.error.size": "File too large. Maximum 50MB supported.",
            "batch.button.download": "Download Results (CSV)",
            "batch.button.new": "Upload New File",
            "batch.error.noRecords": "No valid records found or invalid format.",
            "batch.error.format": "File format error: Please upload a supported file (CSV, XLSX, XLS) with a dx column.",

            // Results
            "results.title": "Classification Result",
            "results.empty": "Enter or paste codes in the left area to see results here...",
            "results.summary": "Overall Status:",
            "results.summary.ccc": "CCC Detected",
            "results.summary.noccc": "No CCC Detected",
            "results.summary.tech": "Tech Dependency Present",
            "results.summary.notech": "No Tech Dependency",
            "results.table.code": "Code",
            "results.table.type": "Type",
            "results.table.description": "Description",
            "results.table.category": "Category",
            "results.table.tech": "Tech Dependency",
            "results.table.yes": "Yes",
            "results.table.no": "No",
            "results.table.match.none": "No Match Found",
            "results.table.match.nodx": "No Valid Dx Code",

            // Categories
            "cat.cardio": "Cardiovascular",
            "cat.resp": "Respiratory",
            "cat.gastro": "Gastrointestinal",
            "cat.neuro": "Neuromuscular",
            "cat.necro": "Neonatal",
            "cat.renal": "Renal",
            "cat.hemato": "Hematologic",
            "cat.metabolic": "Metabolic",
            "cat.cong": "Congenital",
            "cat.malignancy": "Malignancy"
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'tr', // Default per requirements
        interpolation: {
            escapeValue: false // not needed for react as it escapes by default
        }
    });

export default i18n;
