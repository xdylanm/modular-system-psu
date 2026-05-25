window.MathJax = {
  tex: {
    // Support $...$ inline and $$...$$ display math from Jupyter notebook cells.
    // Arithmatex-rendered markdown math uses <script type="math/tex"> elements
    // (handled by renderActions below), not raw $ delimiters.
    inlineMath: [["$", "$"], ["\\(", "\\)"]],
    displayMath: [["$$", "$$"], ["\\[", "\\]"]],
    processEscapes: true,
  },
  options: {
    ignoreHtmlClass: 'tex2jax_ignore',
    processHtmlClass: 'tex2jax_process',
    renderActions: {
      // Rename from 'find' to 'findScript' so this action is ADDED to the
      // pipeline rather than replacing MathJax 3's built-in 'find' action.
      // The built-in 'find' scans text nodes for $...$ and $$...$$ delimiters
      // (needed for Jupyter notebook cells). This action handles the
      // <script type="math/tex"> elements that pymdownx.arithmatex emits
      // for rendered Markdown pages.
      findScript: [10, function (doc) {
        for (const node of document.querySelectorAll('script[type^="math/tex"]')) {
          const display = !!node.type.match(/; *mode=display/);
          const math = new doc.options.MathItem(node.textContent, doc.inputJax[0], display);
          const text = document.createTextNode('');
          const sibling = node.previousElementSibling;
          node.parentNode.replaceChild(text, node);
          math.start = {node: text, delim: '', n: 0};
          math.end = {node: text, delim: '', n: 0};
          doc.math.push(math);
          if (sibling && sibling.matches('.MathJax_Preview')) {
            sibling.parentNode.removeChild(sibling);
          }
        }
      }, '']
    }
  }
};