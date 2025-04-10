'use client'

export function Checkbox({
    name,
    label,
    checked,
    onChange,
}: {
    name: string;
    label: string;
    checked: boolean;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
}) {
    return (
        <label className="inline-flex items-center space-x-2 text-sm">
            <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span>{label}</span>
        </label>
    );
}