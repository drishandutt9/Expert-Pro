import sys
import pymupdf4llm

def main():
    if len(sys.argv) < 2:
        print("No PDF file provided.", file=sys.stderr)
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    try:
        # Extract lossless markdown seamlessly spanning text, lists, and full data tables
        md_text = pymupdf4llm.to_markdown(pdf_path)
        print(md_text)
    except Exception as e:
        print(f"Error parsing PDF with PyMuPDF4LLM: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    # Force UTF-8 encoding for stdout in Python on Windows
    # This prevents UnicodeEncodeError when Node captures the output
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    main()
