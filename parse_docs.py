import os
from docx import Document

with open("d:\\FaReM\\docs_summary.txt", "w", encoding="utf-8") as f:
    for file in os.listdir("Documents"):
        if file.endswith(".docx"):
            f.write(f"--- Parsing {file} ---\n")
            try:
                doc = Document(os.path.join("Documents", file))
                for i, para in enumerate(doc.paragraphs):
                    if para.text.strip():
                        f.write(para.text.strip() + "\n")
                    if i > 50: # just get a snippet
                        f.write("... [TRUNCATED] ...\n")
                        break
            except Exception as e:
                f.write(f"Error parsing {file}: {e}\n")
            f.write("\n")
