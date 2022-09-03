(function() {
  'use strict';

  const $ = document.querySelector.bind(document);
  const $$ = document.querySelectorAll.bind(document);

  const CVData = {
    name: 'Laurent',
    last_name: 'Kirsakowsky',
    age: (Date.now() - new Date('1995-06-27')) / (1e3 * 60 * 60 * 24 * 365) >> 0,
    occupation: 'frontend-developer',
    links: {
      mail: 'kirsakowsky@gmail.com',
      telegram: 'laurent_kir',
      github: 'laurent-kir'
    },
    langs: ['English (A2)'],
    skills: ['HTML', 'Pug', 'CSS', 'Sass/SCSS', 'JS', 'ES6+', 'jQuery', 'JSON', 'Murkdown', 'Git'],
    code_editors: ['Sublime Text 4', 'Visual Studio Code'],
    other_tools: ['Figma', 'PhotoShop'],
    personal_traits: ['trainability', 'responsibility', 'discipline', 'perfectionism'],
    random_just_for_fun: +Math.random().toFixed(9)
  };

  const JSONCode = {
    __init__(title, data) {
      const htmlChunk1 = '$1<span class="json__ellipsis"></span><span class="json__arrow"></span><div class="json__nesting">';
      const htmlChunk2 = '<span class="token-string">"$1"</span>$2</div>';
      const htmlChunk3 = '<span class="token-constant">$1</span>$2</div>';

      let code = JSON.stringify(data, null, 1);
      code = code.replace(/^\s*(\]|\})(,?)/gm, '</div>$1$2</div>');
      code = code.replace(/^\s*(\[|\{)/gm, `<div class="json__item">${htmlChunk1}`);
      code = code.replace(/": (\[|\{)/g, `": ${htmlChunk1}`);
      code = code.replace(/^\s*"([^"]+)":/gm, '<div class="json__item"><span class="token-key">"$1"</span>:');
      code = code.replace(/<\/span>: "(.+)"(,?)/g, `</span>: ${htmlChunk2}`);
      code = code.replace(/<\/span>: (true|false|null|\d+\.?\d*)(,?)/g, `</span>: ${htmlChunk3}`);
      code = code.replace(/^\s*"(.+)"(?!:)(,?)/gm, `<div class="json__item">${htmlChunk2}`);
      code = code.replace(/^\s*(true|false|null|\d+\.?\d*)(,?)/gm, `<div class="json__item">${htmlChunk3}`);

      code = code.replaceAll('\n', '').replace('item', 'item __root');

      code = this.insertLink(code, data.links.github, 'https://github.com/$&');
      code = this.insertLink(code, data.links.mail, 'mailto:$&');
      code = this.insertLink(code, data.links.telegram, 'https://t.me/$&');

      $('.json').innerHTML = `
        <h2 class="heading json__title"><span id="json-title"></span></h2>
        <code class="json__code">${code}</code>
      `;

      $('.json__code').addEventListener('click', this.onClick);
      setTimeout(() => this.animateTitle($('#json-title'), `${title}.json`), 1e3);
    },
    insertLink(code, search, href = '$&') {
      return code.replace(search, `<a href="${href}" target="_blank">${search}</a>`);
    },
    animateTitle(elem, title, counter = 0) {
      elem.textContent = title.slice(0, counter++);
      counter <= title.length
        ? setTimeout(this.animateTitle.bind(this, elem, title, counter), 200)
        : elem.classList.add('__done');
    },
    onClick: e => {
      const trg = e.target;

      if (trg.matches('.token-key')) {
        return trg.nextSibling.data.length === 3
          && trg.nextElementSibling.nextElementSibling.click();
      }
      if (!trg.matches('.json__arrow')) return;

      const item = trg.parentNode;
      item.classList.toggle('__folded');
      item.dataset.size = item.lastElementChild.childElementCount;
    }
  };

  JSONCode.__init__('cv-data', CVData);

  $('#theme-switcher').addEventListener('change', function(e) {
    const mode = this.value;
    document.documentElement.dataset.mode = mode;
  });

  $('#lang-switcher').addEventListener('change', function() {
    const lang = this.value;
    $$('[data-ru]').forEach(elem => {
      elem.textContent = elem.dataset[lang];
    });
  });

  $('#sidebar-switcher').addEventListener('click', () => {
    const elem = $('.main');
    elem.classList.toggle('__shifted', elem.getBoundingClientRect().left <= 0);
  });

  $$('[data-ru]').forEach(elem => elem.setAttribute('data-en', elem.textContent));
  $$('select').forEach(select => select.dispatchEvent(new Event('change')));
})();