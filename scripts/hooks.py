import re


def on_page_content(html, page, config, files, **kwargs):
    if page.file.src_path.endswith(".ipynb"): # == "assets/archive/design.ipynb":
        # Fix image paths: the notebook file is at docs/assets/archive/design.ipynb
        # and renders to site/assets/archive/design/index.html, so relative paths
        # like ./images/ need to become ../images/.
        # Restrict to <img> tags only to avoid touching <script src="./..."> etc.
        html = re.sub(r'(<img\b[^>]*\bsrc=")\./', r'\1../', html)
        html = re.sub(r"(<img\b[^>]*\bsrc=')\./" , r"\1../", html)

        # Remove the MathJax 2 script block injected by mkdocs-jupyter.
        # It calls MathJax.Hub.Config() which does not exist in MathJax 3
        # and causes an error that prevents math from rendering.
        html = re.sub(
            r"<!-- Load mathjax -->.*?<!-- End of mathjax configuration -->",
            "",
            html,
            flags=re.DOTALL,
        )

    return html
