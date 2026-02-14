import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
    FiBold, FiItalic, FiUnderline, FiList,
    FiAlignLeft, FiAlignCenter, FiAlignRight,
    FiLink, FiType, FiMinus,
} from 'react-icons/fi';
import { useEffect } from 'react';

function MenuBar({ editor }) {
    if (!editor) return null;

    return (
        <div className="editor-toolbar">
            <div className="toolbar-group">
                <select
                    className="toolbar-select"
                    value={
                        editor.isActive('heading', { level: 1 }) ? '1' :
                            editor.isActive('heading', { level: 2 }) ? '2' :
                                editor.isActive('heading', { level: 3 }) ? '3' : '0'
                    }
                    onChange={(e) => {
                        const level = parseInt(e.target.value);
                        if (level === 0) {
                            editor.chain().focus().setParagraph().run();
                        } else {
                            editor.chain().focus().toggleHeading({ level }).run();
                        }
                    }}
                >
                    <option value="0">Normal</option>
                    <option value="1">Heading 1</option>
                    <option value="2">Heading 2</option>
                    <option value="3">Heading 3</option>
                </select>
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <button
                    className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    title="Bold"
                >
                    <FiBold />
                </button>
                <button
                    className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    title="Italic"
                >
                    <FiItalic />
                </button>
                <button
                    className={`toolbar-btn ${editor.isActive('underline') ? 'active' : ''}`}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    title="Underline"
                >
                    <FiUnderline />
                </button>
                <button
                    className={`toolbar-btn ${editor.isActive('highlight') ? 'active' : ''}`}
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    title="Highlight"
                >
                    <FiType />
                </button>
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <button
                    className={`toolbar-btn ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    title="Align Left"
                >
                    <FiAlignLeft />
                </button>
                <button
                    className={`toolbar-btn ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    title="Align Center"
                >
                    <FiAlignCenter />
                </button>
                <button
                    className={`toolbar-btn ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    title="Align Right"
                >
                    <FiAlignRight />
                </button>
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <button
                    className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    title="Bullet List"
                >
                    <FiList />
                </button>
                <button
                    className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    title="Ordered List"
                >
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>1.</span>
                </button>
                <button
                    className="toolbar-btn"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    title="Horizontal Rule"
                >
                    <FiMinus />
                </button>
                <button
                    className={`toolbar-btn ${editor.isActive('link') ? 'active' : ''}`}
                    onClick={() => {
                        const url = window.prompt('Enter URL:');
                        if (url) {
                            editor.chain().focus().setLink({ href: url }).run();
                        }
                    }}
                    title="Add Link"
                >
                    <FiLink />
                </button>
            </div>
        </div>
    );
}

export default function ResumeEditor({ content, onContentChange, editorRef }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Highlight.configure({
                multicolor: false,
            }),
            Link.configure({
                openOnClick: false,
            }),
            Placeholder.configure({
                placeholder: 'Start editing your resume here...',
            }),
        ],
        content: content || '',
        onUpdate: ({ editor }) => {
            if (onContentChange) {
                onContentChange(editor.getHTML());
            }
        },
    });

    // Expose editor instance to parent via ref
    useEffect(() => {
        if (editorRef) {
            editorRef.current = editor;
        }
    }, [editor, editorRef]);

    // Update editor content when prop changes
    useEffect(() => {
        if (editor && content && editor.getHTML() !== content) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    return (
        <div className="resume-editor">
            <MenuBar editor={editor} />
            <div className="editor-content-wrapper">
                <EditorContent editor={editor} className="editor-content" />
            </div>
        </div>
    );
}
