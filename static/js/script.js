document.addEventListener('DOMContentLoaded', () => {
    const fileListEl = document.getElementById('file-list');
    const filenameInput = document.getElementById('filename-input');
    const editor = document.getElementById('editor');
    const saveBtn = document.getElementById('save-btn');
    const newFileBtn = document.getElementById('new-file-btn');
    const statusEl = document.getElementById('file-status');

    let currentFile = null;

    async function loadFileList() {
        try {
            const response = await fetch('/api/files');
            const data = await response.json();

            if (data.files) {
                renderFileList(data.files);
            }
        } catch (err) {
            console.error('Ошибка загрузки файлов:', err);
        }
    }

    function renderFileList(files) {
        fileListEl.innerHTML = '';
        files.forEach(file => {
            const el = document.createElement('div');
            el.className = 'file-item';
            if (file === currentFile) el.classList.add('active');
            el.textContent = file;
            el.onclick = () => openFile(file);
            fileListEl.appendChild(el);
        });
    }

    async function openFile(filename) {
        try {
            const response = await fetch(`/api/read/${filename}`);
            const data = await response.json();

            if (data.content !== undefined) {
                editor.value = data.content;
                filenameInput.value = filename;
                currentFile = filename;
                statusEl.textContent = `Открыт: ${filename}`;
                loadFileList();
            }
        } catch (err) {
            alert('Не удалось прочитать файл');
        }
    }

    async function saveFile() {
        const filename = filenameInput.value.trim();
        const content = editor.value;

        if (!filename) {
            alert('Введи имя файла!');
            return;
        }

        try {
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, content })
            });
            const data = await response.json();

            if (data.message) {
                currentFile = filename;
                statusEl.textContent = `Сохранено: ${filename}`;
                loadFileList();
                showNotification();
            } else {
                alert('Ошибка: ' + (data.error || 'Неизвестная ошибка'));
            }
        } catch (err) {
            alert('Ошибка при сохранении');
        }
    }

    function showNotification() {
        saveBtn.textContent = 'ОК!';
        setTimeout(() => {
            saveBtn.textContent = 'Сохранить (Ctrl+S)';
        }, 1500);
    }

    newFileBtn.onclick = () => {
        currentFile = null;
        filenameInput.value = '';
        editor.value = '';
        statusEl.textContent = 'Новый файл';
        document.querySelectorAll('.file-item').forEach(i => i.classList.remove('active'));
    };

    saveBtn.onclick = saveFile;

    window.onkeydown = (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveFile();
        }
    };

    loadFileList();
});
