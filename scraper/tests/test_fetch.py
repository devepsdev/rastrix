from pipeline.fetch import html_to_text


def test_removes_scripts_menus_and_collapses_whitespace():
    html = """
    <html><body>
      <nav>Inicio | Contacto</nav>
      <script>var x = 1;</script>
      <main>
        <h1>Rastro   de   Ejemplo</h1>
        <p>Cada domingo,
           de 9:00 a 14:00.</p>
      </main>
      <footer>Aviso legal</footer>
    </body></html>
    """
    text = html_to_text(html)

    assert "Rastro de Ejemplo" in text
    assert "de 9:00 a 14:00." in text
    assert "Inicio" not in text
    assert "var x" not in text
    assert "Aviso legal" not in text


def test_text_is_capped():
    assert len(html_to_text("<main>" + "palabra " * 10000 + "</main>")) <= 20000


def test_inline_links_do_not_break_sentences():
    text = html_to_text("<main><p>El <a href='#'>Rastro de Madrid</a>, o simplemente <b>El Rastro</b>, abre los domingos.</p><p>Segundo párrafo.</p></main>")
    assert text.splitlines() == ["El Rastro de Madrid, o simplemente El Rastro, abre los domingos.", "Segundo párrafo."]
