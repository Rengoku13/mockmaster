import React from 'react';

interface JsonViewerProps {
    data: any;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
    const jsonString = JSON.stringify(data, null, 2);

    const highlight = (json: string) => {
        if (!json) return '';

        // Regex to match JSON tokens
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
            let cls = 'text-orange-400'; // number
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'text-indigo-400 font-semibold'; // key
                } else {
                    cls = 'text-emerald-400'; // string
                }
            } else if (/true|false/.test(match)) {
                cls = 'text-rose-400 font-semibold'; // boolean
            } else if (/null/.test(match)) {
                cls = 'text-slate-500 italic'; // null
            }
            return `<span class="${cls}">${match}</span>`;
        });
    };

    return (
        <pre
            className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: highlight(jsonString) }}
        />
    );
};
