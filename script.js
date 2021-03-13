(function() {
  "use strict";
  var $ = function(s) {return document.querySelector(s);};(function() {var extend = function(target, source) {for (var key in source) {target[key] = source[key];} return target;};extend($, {toArray: function(a) {var res = [], i = 0; for (; i < a.length; res.push(a[i++])); return res;},parseNode: function(html, callback) {var div = document.createElement('div'); div.innerHTML = html; div = div.firstChild.cloneNode(!0); callback && callback(div); return div;},index: function(e) {return $.toArray(e.parentNode.children).indexOf(e);},rnd: function(n) {return Math.random() * n >> 0;},extend: extend});})();

  !Element.prototype.closest && (Element.prototype.closest = function(s) {
    var that = this, slice = $.toArray, test, parent;
    function checkParent(e) {return e.parentNode === parent;}
    while ((parent = that.parentNode)) {
      test = slice(parent.querySelectorAll(s)).filter(checkParent).indexOf(that) >= 0;
      if (test) return that;
      that = parent;
    } return null;
  });

  var frame = (function(elem) {
    document.body.appendChild(elem);
    var purchase, test = 0;
    var w = elem.contentWindow;
    var that = {
      name: elem.name || 'shopFrame',
      elem: elem,
      frameWindow: w,
      onload: function() {
        if (!(test && purchase)) return;
        test = 0;
        var d = w && w.document && w.document.body;
        if (!(d && d.querySelector('td > a[href="inventory.php"] > b'))) return;
        purchase[0].className = 'art__purchase art__purchase--success';
        purchase[0].firstElementChild.textContent = ++purchase[1];
      },
      purchase: function(obj, callback) {
        test = 1;
        purchase = obj;
        obj[0].className = 'art__purchase';
        callback && callback(obj);
      }
    };

    elem.onload = that.onload;

    return that;
  })($.parseNode('<iframe src="' + location.href + '" class="shopFrame" name="shopFrame"></iframe>'));

  var shopData = (function(l) {
    var category = l.search.match(/cat=(\w+)/);
    return {
      pathname: l.pathname.slice(1, -4),
      search: l.search,
      category: (category && category[1]) || 'weapon',
      rent: (l.search.split('rent=')[1] || '0')[0]
    };
  })(location);

  if (shopData.category === 'other' || shopData.rent !== '0') return;

  var heroLevel = localStorage.heroLevel >> 0 || (function() {
    var level = +prompt('Введите свой БУ') >> 0 || 1;
    localStorage.heroLevel = level;
    return level;
  })();

  var oldShop = (function(table) {
    function getMods(node, reg) {
      if (node.nextElementSibling.tagName !== 'TABLE') return null;

      var obj = {};
      var children = $.toArray(node.nextElementSibling.querySelector('img').closest('tr').children);

      children.forEach(function(x, i) {
        if (i % 2) return;
        var key = x.firstElementChild.src.match(reg)[1];
        obj[key] = x.nextElementSibling.textContent.trim();
      });

      return obj;
    }

    var tbody = table.firstElementChild;

    var tabsData = {
      index: $.index(tbody.querySelector('.wbwhite')),
      data: $.toArray(tbody.firstElementChild.children).slice(0, -1).map(function(e) {
        e = e.firstElementChild;
        return [e.getAttribute('href'), e.textContent];
      })
    };

    var navData = {};
    navData.data = $.toArray(tbody.children[1].children[1].querySelectorAll('a, b')).map(function(x, i) {
      var href = x.getAttribute('href');
      var text = x.textContent;
      if (!href) {
        href = '#';
        navData.index = i;
        navData.section = (text = text.slice(3));
      }
      return [href, text];
    });

    var propsMap = {
      'стоимость': 'cost',
      'требуемый уровень': 'level',
      'прочность': 'durability',
      'очки амуниции': 'OA',
      'доступно для продажи': 'availableForSail'
    };

    var arts = $.toArray(tbody.children[1].children[0].children).filter(function(x) {
      return x.tagName === 'TABLE';
    });

    var artsData = arts.map(function(art, i) {
      var tbody = art.firstElementChild;
      var name = tbody.firstElementChild.textContent.trim();
      var cont = tbody.children[1];
      var link = cont.querySelector('a');
      var props = $.toArray(cont.children[1].children);
      var imgData = [link.getAttribute('href')].concat($.toArray(link.children).map(function(x) {
        return x.getAttribute('src');
      }));
      var buyBox = (function(last, that) {
        if (last.tagName === 'I') {
          var prev = last.previousElementSibling;
          if (/^(A|FONT)$/.test(prev.tagName)) that[prev.textContent] = prev.getAttribute('href') || '#';
          $.toArray(last.querySelectorAll('a')).forEach(function(a) {
            that[a.textContent] = a.getAttribute('href') || '#';
          });
        } else if (last.tagName === 'A') that[last.textContent] = last.getAttribute('href') || '#';

        return that;
      })(props[props.length - 1], {});

      var that = {
        name: name,
        id: link.search.slice(4),
        imgData: imgData,
        buyBox: buyBox
      };

      props.forEach(function(prop) {
        var text = prop.textContent.trim().toLowerCase().replace(/:$/, '');

        switch (text) {
          case 'стоимость':
            that.cost = getMods(prop, /\/48\/(\w+)/);
            break;
          case 'требуемый уровень':
          case 'прочность':
          case 'очки амуниции':
          case 'доступно для продажи':
            that[propsMap[text]] = (function(node) {
              if (node.nodeValue.trim()) return +node.nodeValue.trim();
              return +prop.nextElementSibling.textContent.trim();
            })(prop.nextSibling);
            break;
          case 'описание':
            that.descr = (function(node, descr) {
              while ((node = node.nextSibling).nodeType === 3) descr += node.nodeValue.trim();
              return descr;
            })(prop.nextSibling, '');

            that.secondaryMods = (function(node, list) {
              var last = props[props.length - 1], tag;
              while ((node = node.nextElementSibling)) {
                if ((tag = node.tagName) === 'FONT' || node === last) return list.length && list;
                if (tag === 'I') list.push.apply(list, node.innerText.trim().split('\n'));
              }
              return list.length && list;
            })(prop, []);
            break;
          case 'модификаторы':
            that.primaryMods = getMods(prop, /attr_(\w+)/);
            break;
        }
      });

      return that;
    });

    return {
      table: table,
      tabsData: tabsData,
      navData: navData,
      artsData: artsData
    };
  })($('table.wb[width="95%"]'));

  var newShop = (function(table) {
    var main = table.firstElementChild;
    var tabsElem = main.firstElementChild;

    oldShop.tabsData.data.forEach(function(data) {
      tabsElem.innerHTML += '<a href="' + data[0] + '" class="shop__tab">' + data[1] + '</a>';
    });
    tabsElem.children[oldShop.tabsData.index].className += ' selected';

    var navContainer = $.parseNode('<div class="shop__nav-wrap"><div class="shop__nav-box"><div class="shop__tab">Разделы</div><div class="shop__nav"></div></div></div>');
    var nav = navContainer.querySelector('.shop__nav');
    var navKeys = 's-headwear|s-amulets|s-armor|s-raincoats|s-weapon|s-shields|s-footwear|s-rings|s-other|s-gifts|s-transport'.split('|');

    oldShop.navData.data.forEach(function(data, i) {
      var a = $.parseNode('<a href="' + data[0] + '" id="' + navKeys[i] + '">' + data[1] + '</a>');
      if (data[0] === '#') a.className = 'selected';
      nav.appendChild(a);
    });

    nav.appendChild($.parseNode('<span id="nav-flag"></span>'));

    var filter = (function(elem) {
      var output = elem.firstElementChild;
      var input = elem.lastElementChild;
      var timer, counter;

      input.addEventListener('input', function(e) {
        var val = this.value.toLowerCase();
        counter = 0;
        timer && clearTimeout(timer);

        timer = setTimeout(function() {
          arts.forEach(function(art) {
            if (!val) return (counter += 1) && art.removeAttribute('hidden');

            var text = art.textContent.toLowerCase();

            if (text.indexOf(val) >= 0) (counter += 1) && art.removeAttribute('hidden');
            else art.setAttribute('hidden', !0);
          });

          output.textContent = val ? counter : '';
        }, 400);
      });

      return elem;
    })($.parseNode('<div class="shop__filter"><span></span><input type="text" id="shop__filter" placeholder="Фильтр..."></div>'));

    var artsBox = $.parseNode('<div class="shop__arts-box"></div>');
    var arts = [];

    function auc(id) {
      return 'auction.php?cat=' + shopData.category + '&sort=4&art_type=' + id;
    }

    oldShop.artsData.forEach(function(data, i) {
      var art = $.parseNode('<div class="art" id="art-' + data.id + '"></div>');

      if (data.level > heroLevel) art.className += ' art--unavailable';

      var left = $.parseNode('<div class="art__block art__block--left"></div>', function(block) {
        var imgData = data.imgData;
        var a = $.parseNode('<a class="art__img" href="' + imgData[0] + '"></a>');
        var span = $.parseNode('<span style="background-image: url(' + (imgData[2] || imgData[1]) + ')"></span>');
        a.appendChild(span);
        block.appendChild(a);
      });

      var center=$.parseNode('<div class="art__block art__block--center"></div>', function(block) {
        block.appendChild($.parseNode('<div class="art__name"><a href="' + data.imgData[0] + '">' + data.name + '</a></div>'));
        block.appendChild($.parseNode('<div class="art__type">' + oldShop.navData.section + '</div>'));
        block.appendChild($.parseNode('<div class="art__buy"></div>', function(box) {
          var buyBox = data.buyBox;

          Object.keys(buyBox).forEach(function(key, i) {
            var a = $.parseNode('<a href="' + buyBox[key] + '">' + key + '</a>');
            if (key === 'Купить') {
              a.className = 'a-buy';
              a.target = frame.name;
            }
            box.appendChild(a);
          });

          shopData.category !== 'gift' && box.appendChild($.parseNode('<a href="' + auc(data.id) + '">рынок</a>'));
        }));

        var props = $.parseNode('<div class="art__properties"></div>', function(elem) {
          elem.appendChild($.parseNode('<div class="art__prop a-lvl">Требуемый уровень: <span>' + data.level + '</span></div>'));
          elem.appendChild($.parseNode('<div class="art__prop">Прочность: <span>' + data.durability + '</span></div>'));
          elem.appendChild($.parseNode('<div class="art__prop">Очки амуниции: <span>' + data.OA + '</span></div>'));
          elem.appendChild($.parseNode('<div class="art__prop">Доступно для продажи: <span>' + data.availableForSail + '</span></div>'));

          if (data.primaryMods || data.secondaryMods) {
            elem.appendChild($.parseNode('<div class="art__prop">Модификаторы:</div>'));
            elem.appendChild($.parseNode('<div class="art__modifiers-box"></div>', function(box) {
              if (data.primaryMods) {
                box.appendChild($.parseNode('<div class="art__modifiers art__modifiers--primary"></div>', function(primary) {
                  Object.keys(data.primaryMods).forEach(function(key) {
                    primary.appendChild($.parseNode('<div class="modifier modifier--' + key + '"><span>' + data.primaryMods[key] + '</span></div>'));
                  });
                }));
              }
              if (data.secondaryMods) {
                box.appendChild($.parseNode('<div class="art__modifiers art__modifiers--secondary"></div>', function(secondary) {
                  secondary.innerHTML = data.secondaryMods.map(function(value) {
                    return '<div class="modifier">' + value + '</div>';
                  }).join('');
                }));
              }
            }));
          }
        });

        block.appendChild(props);
        block.appendChild($.parseNode('<div class="art__descr">' + data.descr + '</div>'));

        block.appendChild($.parseNode('<div class="art__cost"></div>', function(cost) {
          cost.innerHTML = Object.keys(data.cost).map(function(key) {
            return '<span class="res res--' + key + '">' + data.cost[key] + '</span>';
          }).join('');
        }));
      });

      var right = $.parseNode('<div class="art__block art__block--right"><div class="art__level a-lvl"><span>' + data.level + '</span></div></div>');

      art.appendChild(left);
      art.appendChild(center);
      art.appendChild(right);
      artsBox.appendChild(art);
      arts.push(art);
    });

    main.appendChild(navContainer);
    main.appendChild(filter);
    main.appendChild(artsBox);

    return {
      table: table,
      nav: nav,
      filter: filter,
      arts: arts,
      init: function() {
        oldShop.table.closest('center > table').setAttribute('data-table', 'old');
        document.body.appendChild(this.style);
        document.body.appendChild(table);
      },
      style: $.parseNode('<style id="new-shop">' + ('@charset "utf-8";html, body {overflow-y: visible;}body {margin: 0;padding: 0;background-color: #ddd9cd;overflow-x: hidden;}[hidden] {display: none !important;}[data-table="old"] {display: block;height: 1px;visibility: hidden;overflow: hidden;}.shopFrame {display: block;width: 100%;height: 0;border: none;overflow: hidden;visibility: hidden;}.shop-table {font-family: Verdana, Arial, sans-serif;font-size: 13px;max-width: 980px;margin: 1em auto;padding: 1px;color: #592c08;position: relative;}.shop-table * {margin: 0;padding: 0;-moz-box-sizing: border-box;-webkit-box-sizing: border-box;box-sizing: border-box;}.shop-table :before,.shop-table :after {-moz-box-sizing: inherit;-webkit-box-sizing: inherit;box-sizing: inherit;}.shop-table a {color: inherit;text-decoration: none;}.shop-table .td-u {text-decoration: underline;text-decoration-skip-ink: none;}.shop-table a:hover,.shop-table a:focus,.shop-table .selected {color: #b00;}.shop-table .selected {font-weight: bold;}.shop-table :focus {outline: none;}.shop__main {margin-right: 180px;margin-bottom: 14px;text-align: left;border: 1px solid #888;}.shop__tabs {border-bottom: 1px solid #888;overflow: hidden;}.shop__tab {width: 33.333%;float: left;padding: 10px 6px;text-align: center;background-color: #eee;border-right: 1px solid #888;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;}.shop__tab:last-child {border-right: none;}.shop__tab:hover,.shop__tab:focus,.shop__tab.selected {background-color: #fff;}.shop__nav-wrap {position: absolute;top: 1px; right: 2px; bottom: 15px;}.shop__nav-box {width: 180px;position: -webkit-sticky;position: sticky;top: -1px;border: 1px solid #888;-webkit-box-shadow: 2px 2px 4px #aaa;box-shadow: 2px 2px 4px #aaa;}.shop__nav-box > .shop__tab {width: auto;float: none;background-color: #ddd;border-right: none;border-bottom: 1px solid #888;cursor: default;}.shop__nav {position: relative;background-color: #eee;overflow: hidden;}.shop__nav > a {display: block;height: 26px;line-height: 24px;padding: 0 4px;border-top: 1px solid silver;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;}.shop__nav > a:first-child {border-top: none;}.shop__nav > a:hover,.shop__nav > a:focus,.shop__nav .selected {background-color: #fff;}.shop__nav > a:before {content: "";width: 24px;height: 24px;display: inline-block;vertical-align: middle;margin-right: 8px;background: url("https://i.ibb.co/NtwYq4d/nav-icons.png") no-repeat 0 0;-webkit-background-size: cover;background-size: cover;-webkit-filter: sepia(.8);filter: sepia(.8);opacity: .8;}.shop__nav > a:hover:before,.shop__nav > a:focus:before,.shop__nav .selected:before {opacity: 1;-webkit-filter: sepia(0) brightness(120%);filter: sepia(0) brightness(120%);}#s-headwear:before {background-position: 0 0;}#s-amulets:before {background-position: 10% 0;}#s-armor:before {background-position: 20% 0;}#s-raincoats:before {background-position: 30% 0;}#s-weapon:before {background-position: 40% 0;}#s-shields:before {background-position: 50% 0;}#s-footwear:before {background-position: 60% 0;}#s-rings:before {background-position: 70% 0;}#s-other:before {background-position: 80% 0;}#s-gifts:before {background-position: 90% 0;}#s-transport:before {background-position: 100% -2px;}#nav-flag {position: absolute;top: 0; right: 2px;height: 26px;background-color: #867157;pointer-events: none;opacity: 0;-webkit-transition: top 0.2s, opacity 1s;transition: top 0.2s, opacity 1s;}#nav-flag:before {content: "";position: absolute;top: 7px; right: 0;border: 6px solid transparent;border-right-color: #867157;}.shop__nav > .selected ~ #nav-flag,.shop__nav > a:hover ~ #nav-flag,.shop__nav > a:focus ~ #nav-flag {opacity: 1;}#s-headwear.selected ~ #nav-flag, a#s-headwear:focus ~ #nav-flag, #s-headwear[href]:hover ~ #nav-flag {top: 0;}#s-amulets.selected ~ #nav-flag, a#s-amulets:focus ~ #nav-flag, #s-amulets[href]:hover ~ #nav-flag {top: 26px;}#s-armor.selected ~ #nav-flag, a#s-armor:focus ~ #nav-flag, #s-armor[href]:hover ~ #nav-flag {top: 52px;}#s-raincoats.selected ~ #nav-flag, a#s-raincoats:focus ~ #nav-flag, #s-raincoats[href]:hover ~ #nav-flag {top: 78px;}#s-weapon.selected ~ #nav-flag, a#s-weapon:focus ~ #nav-flag, #s-weapon[href]:hover ~ #nav-flag {top: 104px;}#s-shields.selected ~ #nav-flag, a#s-shields:focus ~ #nav-flag, #s-shields[href]:hover ~ #nav-flag {top: 130px;}#s-footwear.selected ~ #nav-flag, a#s-footwear:focus ~ #nav-flag, #s-footwear[href]:hover ~ #nav-flag {top: 156px;}#s-rings.selected ~ #nav-flag, a#s-rings:focus ~ #nav-flag, #s-rings[href]:hover ~ #nav-flag {top: 182px;}#s-other.selected ~ #nav-flag, a#s-other:focus ~ #nav-flag, #s-other[href]:hover ~ #nav-flag {top: 208px;}#s-gifts.selected ~ #nav-flag, a#s-gifts:focus ~ #nav-flag, #s-gifts[href]:hover ~ #nav-flag {top: 234px;}#s-transport.selected ~ #nav-flag, a#s-transport:focus ~ #nav-flag, #s-transport[href]:hover ~ #nav-flag {top: 260px;}.shop__filter {padding: 4px 6px;background-color: #ddd;border-bottom: 1px solid #888;overflow: hidden;}.shop__filter > span {color: #266d3c;line-height: 20px;}.shop__filter > span:empty {display: none;}.shop__filter > span:before {content: "Совпадений найдено: ";}#shop__filter {width: 200px;height: 22px;padding: 1px 2px;float: right;background: url("https://i.ibb.co/Zfm1bft/search.png") no-repeat 99% 2px #fff;-webkit-background-size: 16px;background-size: 16px;border: 1px solid #888;transition: background-position .4s;}#shop__filter:hover,#shop__filter:focus {outline: 1px solid #5fb4d6;}#shop__filter:focus {background-position: 112% 2px;}#rent-alert {font-size: .8em;padding: 4px 8px;color: #888;background-color: #d9e1ea;border-bottom: 1px solid #888;}.art {position: relative;min-height: 200px;padding: 8px 0;text-align: left;background-color: #fff;border-bottom: 1px solid #888;overflow: hidden;}.art:last-child {border-bottom: none;}.art:nth-child(even) {background-color: #f2f2f2;}.art:target {background-color: #e5dfbf;}.art__block {float: left;overflow: hidden;}.art__block--left {width: 120px;}.art__block--right {width: 60px;float: right;user-select: none;}.art__block--center {width: 68%;width: -webkit-calc(100% - 180px);width: -moz-calc(100% - 180px);width: calc(100% - 180px);padding: 0 6px;}.art__img {display: block;position: relative;width: 106px;height: 106px;margin: 2px auto;background: url("https://dcdn1.heroeswm.ru/i/art_fon_200x200.png") center;background-color: #e5d2a0;-webkit-background-size: contain;background-size: contain;border: 3px ridge #aaa;overflow: hidden;z-index: 2;}.art__img > span:first-child {display: block;height: 100%;background: no-repeat center;-webkit-background-size: cover;background-size: cover;}.art__craft-box {position: absolute;right: 2px; bottom: 2px; left: 2px;font-size: 0;text-align: right;}.art__craft {display: inline-block;width: 10px;height: 10px;margin-right: 2px;background: url("img/modifiers.png") no-repeat 0 0;-webkit-background-size: cover;background-size: cover;}.art__craft--d {background-position: 0 0;}.art__craft--e {background-position: 0 -10px;}.art__craft--a {background-position: 0 -20px;}.art__craft--w {background-position: 0 -30px;}.art__craft--f {background-position: 0 -40px;}.art__name,.art__type {color: #bf642f;}.art__name {line-height: 1.6;font-weight: bold;text-transform: uppercase;}.art__type:after {content: attr(data-slot);float: right;color: #888;}.art__buy {margin-top: 6px;padding: 6px 0;color: #888;border: 1px dashed silver;border-width: 1px 0;overflow: hidden;}.art__buy > a {margin-right: 4px;}.art__buy > a:not(.a-buy):before {content: "[";}.art__buy > a:not(.a-buy):after {content: "]";}.a-buy:not([href="#"]) {color: #82634b;font-weight: bold;}.art__buy > [href="#"] {pointer-events: none;}.art__purchase {position: relative;padding: 6px 0;text-indent: 25px;border-bottom: 1px dashed silver;overflow: hidden;}.art__purchase--success {text-indent: 0;transition: text-indent 1s .5s;}.art__purchase:before {content: "";width: 16px;height: 16px;position: absolute;left: 0;background: url("https://i.ibb.co/F3ZhKPj/loader.gif") center;-webkit-background-size: cover;background-size: cover;}.art__purchase--success:before {background-image: url("https://i.ibb.co/dPzwZ3V/success.png");opacity: 0;transition: opacity 1s .5s;}.a-purchase {color: #478249;}.a-purchase:before {content: "Артов куплено: ";color: brown;}.art__btn {display: inline-block;position: relative;min-width: 140px;line-height: 28px;font-size: 15px;padding: 0 4px;text-align: center;background-color: #f3e9d1;border: 2px solid #999;border-color: #999 #666 #777 #999;border-radius: 4px;outline: none;cursor: pointer;}.art__btn--right {float: right;}.art__btn[disabled] {cursor: default;background-color: #ddd;border-color: #aaa #bbb #bbb #aaa;}.art__btn:not([disabled]):hover,.art__btn:not([disabled]):focus {background-color: #eadec0;box-shadow: 0 0 3px #aaa;}.art__btn:not([disabled]):active {top: 1px; left: 1px;}.art__btn:not([disabled]):after {content: "";position: absolute;top: 2px; right: 2px; bottom: 2px; left: 2px;border: 1px dashed #999;}.art__rent {padding: 3px 2px 3px 0;line-height: 30px;border-bottom: 1px dashed silver;overflow: hidden;}.rent__select {margin-left: 6px;}.art__rent > .art__btn {float: right;font-size: 13px;min-width: 150px;}.art__properties {margin-top: 6px;}.art__prop {color: #82634b;font-weight: bold;}.art__prop > span {font-weight: normal;color: #9c5959;}.art__modifiers {padding-left: 8px;}.art__modifiers:nth-child(2) {margin-top: 3px;}.art__modifiers:before {display: block;color: #777;line-height: 1.8;font-style: italic;}.art__modifiers--primary:before {content: "Первичные";}.art__modifiers--secondary:before {content: "Вторичные";}.modifier {padding-left: 6px;}.art__modifiers--primary > .modifier {display: inline-block;padding-left: 0;margin: 0 2px;}.art__modifiers--primary > .modifier:before {content: "";width: 22px;height: 22px;display: inline-block;vertical-align: middle;margin-right: 3px;background-position: center;-webkit-background-size: cover;background-size: cover;}.modifier--attack:before {background-image: url("https://dcdn.heroeswm.ru/i/icons/attr_attack.png?v=1");}.modifier--defense:before {background-image: url("https://dcdn.heroeswm.ru/i/icons/attr_defense.png?v=1");}.modifier--magicpower:before {background-image: url("https://dcdn.heroeswm.ru/i/icons/attr_magicpower.png?v=1");}.modifier--knowledge:before {background-image: url("https://dcdn.heroeswm.ru/i/icons/attr_knowledge.png?v=1");}.modifier--fortune:before {background-image: url("https://dcdn.heroeswm.ru/i/icons/attr_fortune.png?v=1");}.modifier--morale:before {background-image: url("https://dcdn.heroeswm.ru/i/icons/attr_morale.png?v=1");}.modifier--initiative:before {background-image: url("https://dcdn.heroeswm.ru/i/icons/attr_initiative.png?v=1");}.art__modifiers--secondary > .modifier:before,.art__modifiers--extra > .modifier:before {content: "•";margin-right: 5px;opacity: .8;}.art__modifiers--secondary span,.art__modifiers--extra span,.art__descr > span {color: #287275;}.art__descr {font-family: "Times New Roman", Times, serif;font-style: italic;font-size: 1.3em;margin: 6px 0;padding: 6px 0;color: #8a632e;border-top: 1px solid silver;border-bottom: 1px solid silver;}.art__cost {text-align: right;user-select: none;}.res {margin: 0 2px;}.res:before,.res-in-gold:after {content: "";width: 22px;height: 22px;margin-right: 2px;display: inline-block;vertical-align: middle;background: url("https://dcdn2.heroeswm.ru/i/r/48/gold.png?v=3.23de65") center;-webkit-background-size: cover;background-size: cover;}.res--wood:before {background-image: url("https://dcdn2.heroeswm.ru/i/r/48/wood.png?v=3.23de65");}.res--ore:before {background-image: url("https://dcdn2.heroeswm.ru/i/r/48/ore.png?v=3.23de65");}.res--mercury:before {background-image: url("https://dcdn2.heroeswm.ru/i/r/48/mercury.png?v=3.23de65");}.res--sulfur:before {background-image: url("https://dcdn2.heroeswm.ru/i/r/48/sulfur.png?v=3.23de65");}.res--crystals:before {background-image: url("https://dcdn2.heroeswm.ru/i/r/48/crystals.png?v=3.23de65");}.res--gems:before {background-image: url("https://dcdn2.heroeswm.ru/i/r/48/gems.png?v=3.23de65");}.res--diamonds:before {background-image: url("https://dcdn2.heroeswm.ru/i/r/48/diamonds.png?v=3.23de65");}.res-in-gold {float: left;display: none;}.res-in-gold:before {content: "Всего: ";}.res-in-gold:after {margin-right: 0;margin-left: 2px;}.art__cost:hover > .res-in-gold {display: block;}.art__level {float: right;width: 30px;height: 30px;line-height: 28px;margin-right: 6px;font-weight: bold;text-align: center;color: #1d793d;background-color: #dcf1e3;border: 2px dotted #888;border-radius: 50%;}.art--unavailable .art__level {background-color: #f3dede;}.art--unavailable .a-lvl > span {color: #d00;}@media screen and (max-width: 800px) {.shop__main {margin-right: 0;}.shop__nav-wrap {position: static;overflow: hidden;}.shop__nav-box {width: auto;position: static;border-width: 0 0 1px;box-shadow: none;}.shop__nav-box > .shop__tab,#nav-flag {display: none;}.shop__nav > a {width: 50%;float: left;}.shop__nav > a:nth-child(2) {border-top: none;}.shop__nav > a:nth-child(odd) {border-right: 1px solid silver;}.shop__nav > a:nth-child(odd):nth-last-child(2) {width: 100%;border-right: none;text-align: center;}.res-in-gold {display: none !important;}}@media screen and (max-width: 600px) {.art__block {float: none;}.art__block--right {width: auto;position: absolute;top: 8px; right: 0;}.art__block--right:before {content: "Требуемый уровень:";line-height: 30px;margin-right: 8px;color: #9c5959;}.art__block--center {width: auto;padding: 8px 8px 0;}}@media screen and (max-width: 450px) {.art__rent {line-height: normal;}.art__rent > .art__btn {display: block;float: none;max-width: 180px;margin-top: 3px;}}') + '</style>')
    };
  })($.parseNode('<div class="shop-table"><div class="shop__main"><div class="shop__tabs"></div></div></div>'));

  newShop && newShop.init();

  document.addEventListener('mouseover', function(e) {
    /* Функция подсчитывает общую цену арта (золото + ресурсы)
    и добавляет новый элемент в строку стоимости (.art__cost).
    Отображение регулируется через CSS. */
    var trg = e.target;
    var test = /art__cost/.test(trg.className);
    if (!test) return;
    test = trg.querySelector('.res-in-gold');
    if (test) return;
    var nodes = $.toArray(trg.children);
    if (nodes.length === 1) return;
    var total = 0;
    nodes.forEach(function(node) {
      var text = node.textContent;
      if (/gold/.test(node.className)) total += +text.replace(/,/g, '');
      else if (/wood|ore/.test(node.className)) total += text * 180;
      else total += text * 360;
    });
    total += '';
    switch (total.length) {
      case 4: total = total[0] + ',' + total.slice(1); break;
      case 5: total = total.slice(0, 2) + ',' + total.slice(2); break;
      case 6: total = total.slice(0, 3) + ',' + total.slice(3); break;
    }
    trg.innerHTML += '<span class="res-in-gold">' + total + '</span>';
  });
  document.addEventListener('click', function(e) {
    var trg = e.target, purchase;
    if (trg === trg.closest('.a-buy')) {
      purchase = trg._purchase;
      if (!purchase || typeof purchase !== 'object') {
        purchase = trg._purchase = [$.parseNode('<div class="art__purchase"><span class="a-purchase">0</span></div>'), 0];
        trg.parentNode.parentNode.insertBefore(purchase[0], trg.parentNode.nextElementSibling);
      }
      frame.purchase(purchase);
    }
  });

  setTimeout(function() {
    console.clear();
    console.log(shopData);
    console.log(oldShop);
    console.log(newShop);
    console.log(frame);
  }, 40);
})();
