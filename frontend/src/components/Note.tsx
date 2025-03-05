
interface NoteProps {
    children: React.ReactNode;
    title?: string;
}

const Note = ({ children, title = "NOTE" }: NoteProps) => {
    return (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg shadow-sm mt-4 ">
            <h2 className="text-lg font-bold text-yellow-800 mb-2">{title}</h2>
            {children}
        </div>
    );
};

export default Note;
