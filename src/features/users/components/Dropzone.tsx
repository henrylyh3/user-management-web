"use client";

import { useCallback, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";

type DropzoneProps = {
	onFilesSelected?: (files: File[]) => void;
	accept?: string;
	multiple?: boolean;
};

export default function Dropzone({
	onFilesSelected,
	accept = "*",
	multiple = false,
}: DropzoneProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
	const [error, setError] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const validateFiles = useCallback(
		(files: File[]) => {
			if (!multiple && files.length > 1) {
				setError("Only one file is allowed.");
				return false;
			}

			if (accept !== "*") {
				const allowedTypes = accept.split(",").map((type) => type.trim());

				const allValid = files.every((file) =>
					allowedTypes.some(
						(type) => file.type === type || file.name.endsWith(type),
					),
				);

				if (!allValid) {
					setError(`Invalid file type. Allowed: ${accept}`);
					return false;
				}
			}

			setError("");
			return true;
		},
		[accept, multiple],
	);

	const handleFiles = useCallback(
		(files: FileList | File[]) => {
			const fileArray = Array.from(files);

			if (!validateFiles(fileArray)) return;

			setDroppedFiles(fileArray);
			onFilesSelected?.(fileArray);
		},
		[validateFiles, onFilesSelected],
	);

	function handleDragOver(event: DragEvent<HTMLDivElement>) {
		event.preventDefault();
		event.stopPropagation();
		setIsDragging(true);
	}

	function handleDragLeave(event: DragEvent<HTMLDivElement>) {
		event.preventDefault();
		event.stopPropagation();
		setIsDragging(false);
	}

	function handleDrop(event: DragEvent<HTMLDivElement>) {
		event.preventDefault();
		event.stopPropagation();
		setIsDragging(false);

		const files = event.dataTransfer.files;

		if (files.length > 0) {
			handleFiles(files);
		}
	}

	function handleClick() {
		inputRef.current?.click();
	}

	function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
		const files = event.target.files;

		if (files && files.length > 0) {
			handleFiles(files);
		}
	}

	function handleRemoveFile(index: number) {
		const updated = droppedFiles.filter((_, fileIndex) => fileIndex !== index);

		setDroppedFiles(updated);
		setError("");
		onFilesSelected?.(updated);

		if (updated.length === 0 && inputRef.current) {
			inputRef.current.value = "";
		}
	}

	return (
		<div className="w-full max-w-xl mx-auto">
			<div
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={handleClick}
				className={`
					flex flex-col items-center justify-center
					border-2 border-dashed rounded-2xl
					p-10 cursor-pointer transition-all duration-300
					${
						isDragging
							? "border-orange-400 bg-orange-50 scale-[1.02]"
							: "border-gray-300 bg-gray-50 hover:border-orange-300 hover:bg-orange-50"
					}
				`}
			>
				<div className="mb-4 text-5xl select-none">
					{isDragging ? "📂" : "📁"}
				</div>

				<p className="text-gray-600 text-base font-medium text-center">
					{isDragging
						? "Release to drop your files here!"
						: "Drag & drop files here, or click to browse"}
				</p>

				<p className="text-gray-400 text-sm mt-1 text-center">
					{accept === "*" ? "All file types accepted" : `Accepted: ${accept}`}
				</p>

				<input
					ref={inputRef}
					type="file"
					accept={accept}
					multiple={multiple}
					className="hidden"
					onChange={handleInputChange}
				/>
			</div>

			{error && (
				<p className="mt-3 text-sm text-red-500 font-medium text-center">
					{error}
				</p>
			)}

			{droppedFiles.length > 0 && (
				<ul className="mt-4 space-y-2">
					{droppedFiles.map((file, index) => (
						<li
							key={index}
							className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm"
						>
							<div className="flex items-center gap-3 overflow-hidden">
								<span className="text-xl">📄</span>

								<div className="overflow-hidden">
									<p className="text-sm font-medium text-gray-700 truncate">
										{file.name}
									</p>

									<p className="text-xs text-gray-400">
										{(file.size / 1024).toFixed(1)} KB
									</p>
								</div>
							</div>

							<button
								type="button"
								onClick={(event) => {
									event.stopPropagation();
									handleRemoveFile(index);
								}}
								className="ml-4 text-gray-400 hover:text-red-500 transition-colors text-lg font-bold"
								aria-label="Remove file"
							>
								X
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}