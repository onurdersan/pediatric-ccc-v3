import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function BatchUploader() {
    const { t } = useTranslation();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const SUPPORTED_EXTENSIONS = ['.csv', '.xlsx', '.xls'];

    const handleFile = useCallback((selectedFile) => {
        setError('');
        setSuccess(null);

        if (!selectedFile) return;

        const fileName = selectedFile.name.toLowerCase();
        const hasValidExtension = SUPPORTED_EXTENSIONS.some(ext => fileName.endsWith(ext));
        if (!hasValidExtension) {
            setError(t('batch.error.format'));
            return;
        }

        if (selectedFile.size > 50 * 1024 * 1024) {
            setError(t('batch.error.size'));
            return;
        }

        setFile(selectedFile);
    }, [t]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        handleFile(droppedFile);
    }, [handleFile]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOver(false);
    }, []);

    const handleProcess = useCallback(async () => {
        if (!file) return;

        setLoading(true);
        setError('');
        setSuccess(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/classify-batch', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                // Try to parse JSON error
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    setError(data.message || t('batch.error'));
                } else {
                    setError(t('batch.error'));
                }
                return;
            }

            // Download the CSV file
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'ccc_v3_sonuclar.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            const totalRows = response.headers.get('X-Total-Rows') || '?';
            const skippedRows = response.headers.get('X-Skipped-Rows') || '0';

            setSuccess({
                totalRows,
                skippedRows,
            });
        } catch (err) {
            setError(t('batch.error'));
        } finally {
            setLoading(false);
        }
    }, [file]);

    const handleClear = useCallback(() => {
        setFile(null);
        setError('');
        setSuccess(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    return (
        <div className="ccc-batch">
            <div className="ccc-batch-description">
                <h2>{t('batch.title')}</h2>
                <p>{t('batch.description.1')}<br />{t('batch.description.2')}</p>
            </div>

            {/* Upload Zone */}
            <div
                className={`ccc-upload-zone ${dragOver ? 'ccc-upload-zone--dragover' : ''} ${file ? 'ccc-upload-zone--has-file' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
                aria-label={t('batch.dropzone.ariaLabel')}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={e => handleFile(e.target.files[0])}
                    className="ccc-file-input"
                    aria-label={t('batch.dropzone.ariaLabel')}
                />

                {file ? (
                    <div className="ccc-file-info">
                        <span className="ccc-file-icon">📄</span>
                        <div>
                            <p className="ccc-file-name">{file.name}</p>
                            <p className="ccc-file-size">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                    </div>
                ) : (
                    <div className="ccc-upload-prompt">
                        <span className="ccc-upload-icon">⬆️</span>
                        <p className="ccc-upload-text">{t('batch.dropzone.select')}</p>
                        <p className="ccc-upload-hint">{t('batch.dropzone.drag')}</p>
                    </div>
                )}
            </div>

            <p className="ccc-column-hint">{t('batch.requirements.title')} {t('batch.req.id')}, {t('batch.req.dx')}</p>

            {/* Action Buttons */}
            <div className="ccc-actions">
                <button
                    className="ccc-btn ccc-btn--primary"
                    onClick={handleProcess}
                    disabled={!file || loading}
                >
                    {loading ? t('batch.processing') : t('batch.button.download')}
                </button>
                <button
                    className="ccc-btn ccc-btn--secondary"
                    onClick={handleClear}
                    disabled={loading}
                >
                    {/* fallback to new or clear string */}
                    {t('batch.button.new')}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="ccc-error" role="alert">
                    <strong>{error}</strong>
                </div>
            )}

            {/* Success */}
            {success && (
                <div className="ccc-success" role="status">
                    <strong>{t('batch.success', { count: success.totalRows })}</strong>
                    {Number(success.skippedRows) > 0 && (
                        <p className="ccc-warning-text">{success.skippedRows} satır atlandı (hatalı veri).</p>
                    )}
                </div>
            )}
        </div>
    );
}
