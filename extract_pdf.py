import sys
from pypdf import PdfReader

def main():
    if len(sys.argv) < 2:
        print("No PDF file provided.", file=sys.stderr)
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
        
        # Print the extracted text to stdout so Node can capture it
        print(text)
    except Exception as e:
        print(f"Error parsing PDF: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    # Force UTF-8 encoding for stdout in Python on Windows
    # This prevents UnicodeEncodeError when Node captures the output
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    main()
