(function(currentScript) {
  "use strict";
  var $ = (function() {function fn(s) {return document.querySelector(s);}function extend(target, source) {for (var key in source) {target[key] = source[key];} return target;}return extend(fn, {toArray: function(a) {var res = [], i = 0; for (; i < a.length; res.push(a[i++])); return res;},parseNode: function(html, callback) {var div = document.createElement('div'); div.innerHTML = html; div = div.firstChild.cloneNode(!0); callback && callback(div); return div;},index: function(e) {return fn.toArray(e.parentNode.children).indexOf(e);},rnd: function(n) {return Math.random() * n >> 0;},extend: extend});})();

  !Element.prototype.closest && (Element.prototype.closest = function(s) {
    var that = this, slice = $.toArray, test, parent;
    function checkParent(e) {return e.parentNode === parent;}
    while ((parent = that.parentNode)) {
      test = slice(parent.querySelectorAll(s)).filter(checkParent).indexOf(that) >= 0;
      if (test) return that;
      that = parent;
    } return null;
  });

  var shopRedisign = function() {
    var isOverflow = !!$('td > b > font[color="red"]');

    var heroLevel = 15||localStorage.heroLevel >> 0 || (function() {
      var level = +prompt('Введите свой БУ') >> 0 || 1;
      localStorage.heroLevel = level;
      return level;
    })();

    var shopData = (function(l) {
      var search = l.search;
      var category = search.match(/cat=(\w+)/);
      return {
        pathname: l.pathname.slice(1, -4),
        category: (category && category[1]) || 'weapon',
        rent: (l.search.split('rent=')[1] || '0')[0],
        toString: function() {
          return search;
        }
      };
    })(location);

    var frame = (function(elem) {
      document.body.appendChild(elem);

      var w = elem.contentWindow, test, purchase;
      var that = {
        name: elem.name || 'shopFrame',
        target: elem,
        frameWindow: w,
        elements: [],
        onload: function() {
          if (!(test && purchase)) return;

          var body = w.document && w.document.body;

          if (that.overflow()) return purchase[0].parentNode.removeChild(purchase[0]);
          if (!(body && body.querySelector('td.wbwhite[align="center"][style] b'))) return;

          test = 0;
          purchase[0].className = 'art__purchase art__purchase--success';
          purchase[0].firstElementChild.textContent = ++purchase[1];
          newShop.table.removeAttribute('data-process');
        },
        purchase: function(o, callback) {
          if (test) return;

          test = 1;
          purchase = o.purchase;
          purchase[0].className = 'art__purchase';
          callback && callback(o);
          newShop.table.setAttribute('data-process', '');
        },
        overflow: function() {
          var body = w.document && w.document.body;

          if (body && body.querySelector('td > b > font[color="red"]')) return alert('Инвентарь переполнен!'), !0;

          return !1;
        },
        fix: function(newName) {
          var oldName = this.name;

          w.name = this.name = elem.name = newName;

          this.elements.forEach(function(e) {
            return e.target = newName;
          });
        }
      };

      elem.onload = that.onload;

      return that;
    })($.parseNode('<iframe src="' + location.href + '" class="shopFrame" name="shopFrame"></iframe>'));

    var otherData = (function(cat) {
      if (cat !== 'other') return {};

      function extend(html) {
        return function(e) {
          e.innerHTML += html;
        }
      }
      return {
        gift_box: {
          descr: 'Волшебный ларец, содержимое которого неизвестно. В нем можно найти всё что угодно, от элементов гильдии наемников и очков умения фракции до уникальных артефактов из лучших комплектов Империи. Каждый ларец дополнительно содержит случайный артефакт существ.',
          propsExtend: extend('<p>Данный сундук выдается любому герою бесплатно, как бонус, за каждые <span style="color: teal;">10</span> приобретённых бриллиантов единовременно. Также может быть приобретен в <a class="td-u" href="/shop.php">магазине артефактов</a>.</p><p class="art__prop" style="margin-top: 1em;">Внимание! Стоимость подарка чаще дешевле стоимости ларца.</p><p class="art__prop" style="margin-top: 1em;">Ларец не передается и не занимает место в инвентаре.</p><p style="margin-top: 1em;">Статистика редких ларцов доступна по <a class="td-u" href="gift_box_log.php">ссылке</a>.</p>')
        },
        ba: {
          descr: 'Благословение не является артефактом. Срок действия эффектов - <span>30</span> дней с момента покупки.',
          propsExtend: extend('<div class="art__prop">Преимущества:</div><div class="art__modifiers-box"><div class="art__modifiers art__modifiers--extra"><div class="modifier">Удвоенный размер инвентаря;</div><div class="modifier">Удвоенное количество лотов на рынке;</div><div class="modifier">Задания гильдий Охотников, Наёмников, Воров, Рейнджеров на <span>30%</span> чаще;</div><div class="modifier">Возможность один раз в день сменить одно задание гильдии Стражей (если за него не были получены звезды);</div><div class="modifier">Получаемые умения в боях <span>+10%</span>;</div><div class="modifier">Максимальное количество заданий в гильдии Лидеров увеличено до <span>4</span>;</div><div class="modifier">Получаемые очки гильдии Рабочих <span>+50%</span>;</div><div class="modifier">Премиум транспорт.</div></div></div>')
        },
        green_scroll: {
          descr: 'Позволяет призвать случайный отряд для Гильдии Лидеров с лидерством <span>15,000</span>.<br>Доступно для покупки: <span>10</span> в неделю.',
          propsExtend: extend('<div class="art__modifiers-box"><div class="art__modifiers art__modifiers--extra"><div class="modifier">Шанс призыва обычного отряда - <span>90%</span></div><div class="modifier">Шанс призыва редкого отряда - <span>10%</span></div></div></div>')
        },
        red_scroll: {
          descr: 'Позволяет призвать случайный отряд для Гильдии Лидеров с лидерством <span>5,000</span>.<br>Доступно для покупки: <span>10</span> в неделю.',
          propsExtend: extend('<div class="art__modifiers-box"><div class="art__modifiers art__modifiers--extra"><div class="modifier">Шанс призыва редкого отряда - <span>95%</span></div><div class="modifier">Шанс призыва очень редкого отряда - <span>4%</span></div><div class="modifier">Шанс призыва легендарного отряда - <span>1%</span></div></div></div>')
        },
        gold_scroll: {
          descr: 'Позволяет призвать случайный отряд для Гильдии Лидеров с лидерством <span>10,000</span>.<br>Доступно для покупки: <span>10</span> в неделю.',
          propsExtend: extend('<div class="art__modifiers-box"><div class="art__modifiers art__modifiers--extra"><div class="modifier">Шанс призыва редкого отряда - <span>75%</span></div><div class="modifier">Шанс призыва очень редкого отряда - <span>20%</span></div><div class="modifier">Шанс призыва легендарного отряда - <span>5%</span></div></div></div>')
        },
        elixir: {
          descr: 'Эликсир восстанавливает готовность армии и полностью восполняет ману. При покупке больше одной штуки, занимает только одно место в инвентаре.'
        },
        skill_drink: {
          descr: 'Волшебное зелье, наделяющее даром истинной проницательности. Испивший его Герой во время боёв обретает умение своей фракции, равное среднему умению (<a href="http://daily.heroeswm.ru/n/Skills_WG_AG" class="td-u">см. таблицу средних умений</a>) на текущем боевом уровне или максимальному умению другого не превышающего по боевому уровню участника боя минус 1. Приоритет отдаётся наибольшему показателю. Эффект распространяется на все виды боёв, но только на активную в момент употребления фракцию, и длится не более <span>7</span> дней.'
        },
        laborers_guild_booster: {
          descr: 'Увеличивает получаемые очки Гильдии Рабочих в <span>6</span> раз при условии, что текущий уровень гильдии меньше среднего для текущего боевого уровня.<br>Не увеличивает заработок. Эффект длится <span>7</span> дней.'
        },
        watchers_guild_booster: {
          descr: 'В два раза увеличивает количество доступных заданий гильдии при условии, что текущий уровень гильдии меньше среднего для текущего боевого уровня.<br>Эффект длится <span>7</span> дней.'
        },
        thiefs_guild_booster: {
          descr: 'Полностью отменяет ожидание после поражения в засаде и ускоряет поиск нового каравана при условии, что текущий уровень гильдии меньше среднего для текущего боевого уровня.<br>Эффект длится <span>7</span> дней.'
        },
        rangers_guild_booster: {
          descr: 'Полностью отменяет ожидание после поражения вору, а так же увеличивает получаемые очки гильдии в два раза. Зелье работает при условии, что текущий уровень гильдии меньше среднего для текущего боевого уровня.<br>Эффект длится <span>7</span> дней.'
        }
      };
    })(shopData.category);

    var shopSet = {
      propsMap: {
        'стоимость': 'cost',
        'требуемый уровень': 'level',
        'прочность': 'durability',
        'очки амуниции': 'OA',
        'доступно для продажи': 'availableForSail'
      },
      auc: (function(cat) {
        return function(id) {
          return 'auction.php?cat=' + cat + '&sort=4&art_type=' + id;
        };
      })(shopData.category),
      createLink: (function(cat) {
        return cat !== 'other' ? (function(el, id) {
          var text = el.textContent.trim();
          var isBuy = text === 'Купить';
          var link = $.parseNode('<a href="#">' + (text[0].toUpperCase() + text.slice(1)) + '</a>');

          if (isBuy) link.className = 'a-link a-buy';
          if (!el.href) link.setAttribute('tabindex', '-1');
          else {
            var href = el.getAttribute('href');

            if (el.id) link.id = el.id;
            if (isBuy) {
              link.target = frame.name;
              frame.elements.push(link);
            }

            link.setAttribute('href', (!/аренда|продажа/i.test(text) ? href : href + '#art-' + id));
          }

          return link;
        }) : (function(el) {
          var text = el.textContent.trim();
          var link = $.parseNode('<a href="#" class="a-link art__btn"></a>');

          if (el.disabled) {
            link.setAttribute('tabindex', '-1');
          } else {
            var href = el.getAttribute('onclick');
            href = href && (href.match(/shop\.php[^']+/) || '')[0];

            if (el.id) link.id = el.id;

            link.target = frame.name;
            link.setAttribute('href', href || '#');
            frame.elements.push(link);
          }

          link.innerHTML = !el.querySelector('img') ? text : text + ' <span class="res res--diamonds"></span>';

          return link;
        });
      })(shopData.category),
      getMods: function(node, reg) {
        if (node.nextElementSibling.tagName !== 'TABLE') return null;

        var that = {};
        var children = $.toArray(node.nextElementSibling.querySelector('img').closest('tr').children);

        children.forEach(function(x, i) {
          if (i % 2) return;
          var key = x.firstElementChild.src.match(reg)[1];
          that[key] = x.nextElementSibling.textContent.trim();
        });

        return that;
      },
      artInfo: function(art) {
        var tbody = art.firstElementChild;
        var name = tbody.firstElementChild.textContent.trim();
        var cont = tbody.children[1];
        var right = cont.children[1];
        var image = cont.querySelector('img');
        var imgParent = image.parentNode;

        imgParent.childElementCount > 1 && (image = image.nextElementSibling);

        var href = imgParent.getAttribute('href') || '#';
        var id = imgParent.tagName === 'A' ? imgParent.search.slice(4).match(/[^&]*/)[0] : image.src.split('/').pop().slice(0, -4);

        var props = $.toArray(right.children).filter(function(node) {
          return node.tagName !== 'BR';
        });

        var lastProp = props[props.length - 1];

        var that = {
          name: name,
          id: id,
          href: href,
          imgSrc: image.src,
          buyBox: this.buyBox({
            id: id,
            elem: right.lastElementChild,
          })
        };

        if (shopData.rent === '2') {
          that.name = that.name.match(/[^\[]+/)[0].trim();

          that.craftData = $.toArray(imgParent.children).slice(2).map(function(img) {
            return [(img.src.match(/(\w\d+)\.gif/) || '')[1], img.title];
          });
        }

        props.forEach(function(prop, ind) {
          return this.getProps(that, prop, ind, lastProp);
        }, this);

        if (otherData[id]) $.extend(that, otherData[id]);

        return that;
      },
      createArt: function(that) {
        var data = that.data;
        var art = $.parseNode('<div class="art" id="art-' + data.id + '"></div>');

        if (data.level > heroLevel) art.className += ' art--unavailable';

        var left = $.parseNode('<div class="art__block art__block--left"><a class="art__img" href="' + data.href + '"><span style="background-image: url(' + data.imgSrc + ')"></span></a></div>');

        if (data.craftData) {
          left.firstElementChild.appendChild($.parseNode('<span class="art__craft-box"></span>', function(box) {
            box.innerHTML = data.craftData.map(function(x) {
              return '<span class="art__craft art__craft--' + x[0] + '" title="' + x[1] + '"></span>';
            }).join('');
          }));
        }

        var center = $.parseNode('<div class="art__block art__block--center"></div>', function(block) {
          block.appendChild($.parseNode('<div class="art__name"><a href="' + data.href + '">' + data.name + '</a></div>'));
          block.appendChild($.parseNode('<div class="art__type">' + oldShop.navData.section + '</div>'));

          block.appendChild($.parseNode('<div class="art__buy"></div>', function(box) {
            data.buyBox.forEach(function(a) {
              box.appendChild(a);
            });

            !/gift|other/.test(shopData.category) && box.appendChild($.parseNode('<a href="' + shopSet.auc(data.id) + '">Рынок</a>'));
          }));

          block.appendChild($.parseNode('<div class="art__properties"></div>', function(elem) {
            data.level && elem.appendChild($.parseNode('<div class="art__prop a-lvl">Требуемый уровень: <span>' + data.level + '</span></div>'));

            data.durability && elem.appendChild($.parseNode('<div class="art__prop">Прочность: <span>' + data.durability + '</span></div>'));

            data.OA && elem.appendChild($.parseNode('<div class="art__prop">Очки амуниции: <span>' + data.OA + '</span></div>'));

            'availableForSail' in data && elem.appendChild($.parseNode('<div class="art__prop">Доступно для продажи: <span>' + data.availableForSail + '</span></div>'));

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
          }));

          data.descr && block.appendChild($.parseNode('<div class="art__descr">' + data.descr + '</div>'));

          data.cost && block.appendChild($.parseNode('<div class="art__cost"></div>', function(cost) {
            cost.innerHTML = Object.keys(data.cost).map(function(key) {
              return '<span class="res res--' + key + '">' + data.cost[key] + '</span>';
            }).join('');
          }));
        });

        var right = $.parseNode('<div class="art__block art__block--right"><div class="art__level a-lvl"><span>' + (data.level || 1) + '</span></div></div>');

        art.appendChild(left);
        art.appendChild(center);
        art.appendChild(right);
        that.callback && that.callback(art, data);

        this.artsBox.appendChild(art);
        this.arts.push(art);
      },
      buyBox: (function(cat) {
        return cat !== 'other' ? (function(that) {
          var elem = that.elem, list = [];

          if (elem.tagName === 'I') {
            var prev = elem.previousElementSibling;

            if (/^(a|font)$/i.test(prev.tagName)) list.push(this.createLink(prev, that.id));

            $.toArray(elem.querySelectorAll('a')).forEach(function(a) {
              list.push(this.createLink(a, that.id));
            }, this);
          } else if (elem.tagName === 'A') list.push(this.createLink(elem, that.id));

          return list;
        }) : (function(that) {
          var elem = that.elem;

          if (elem.tagName === 'TABLE') return $.toArray(elem.querySelectorAll('button')).map(this.createLink);
          else if (elem.tagName === 'FONT' && otherData[that.id]) otherData[that.id].boosterAlert = $.parseNode('<div class="boosterAlert">' + elem.innerHTML + '</div>');

          elem = elem.parentNode.querySelector('button:last-of-type');

          if (elem) return [this.createLink(elem)];

          return [];
        });
      })(shopData.category),
      getProps: function(that, prop, ind, last) {
        if (!ind && +shopData.rent && prop.tagName === 'TABLE') {
          var img = prop.querySelector('img');
          var formCont = document.getElementById(that.id);

          if (img) that.cost = {gold: img.parentNode.nextElementSibling.textContent.trim()};
          if (formCont) {
            formCont.querySelector('a').click();
            that.form = formCont.firstElementChild;
          }

          return;
        }

        var text = prop.textContent.trim().toLowerCase().replace(/:$/, '');

        switch (text) {
          case 'стоимость':
            !that.cost && (that.cost = this.getMods(prop, /\/48\/(\w+)/));
            break;
          case 'требуемый уровень':
          case 'прочность':
          case 'очки амуниции':
          case 'доступно для продажи':
            that[this.propsMap[text]] = (function(node) {
              if (node.nodeValue.trim()) return +node.nodeValue.trim();
              return +prop.nextElementSibling.textContent.trim();
            })(prop.nextSibling);
            break;
          case 'описание':
            if (shopData.category === 'other') break;
            that.descr = (function(node, descr) {
              while ((node = node.nextSibling).nodeType === 3) descr += node.nodeValue.trim();
              return descr;
            })(prop.nextSibling, '');
            break;
          case 'модификаторы':
            that.primaryMods = this.getMods(prop, /attr_(\w+)/);
            that.secondaryMods = (function(node, list) {
              var tag;
              while ((node = node.nextElementSibling)) {
                if ((tag = node.tagName) === 'FONT' || node === last) return list.length && list;
                if (tag === 'I') list.push.apply(list, node.innerText.trim().split('\n'));
              }
              return list.length && list;
            })(prop, []);
            break;
        }
      },
      artsDataEach: function(that) {
        var formApp = (function(rent) {
          return !rent ? null : ({
            change: function(oldSelect, output, mult) {
              return function() {
                output.textContent = shopSet.toLocaleString(mult * this.value);
                oldSelect.selectedIndex = this.selectedIndex;
                oldSelect.onchange();
              }
            },
            wheel: function(max) {
              return function(e) {
                var deltaY = e.deltaY;
                var ind = this.selectedIndex;

                if (deltaY < 0 && ind - 1 >= 0) --this.selectedIndex;
                else if (deltaY > 0 && ind + 1 < max) ++this.selectedIndex;

                this.onchange();

                return !1;
              }
            },
          });
        })(+shopData.rent);

        var callback = (function() {
          return shopData.category === 'other' ? (function(art, data) {
            var center = art.children[1];

            if (data.boosterAlert) {
              var descr = center.querySelector('.art__descr');
              descr && descr.appendChild(data.boosterAlert);
            }
            if (data.propsExtend) {
              var propsElem = center.querySelector('.art__properties');
              propsElem && data.propsExtend(propsElem);
            }
          }) : formApp ? (function(art, data) {
            var center = art.children[1];

            data.form && center.insertBefore($.parseNode('<div class="art__rent"><span class="art__prop">Аренда на (кол-во боев):</span></div>', function(rent) {
              var form = data.form;

              form.target = frame.name;
              frame.elements.push(form);

              var btn = $.parseNode('<button class="a-link art__btn">Аренда: <span class="res res--gold">' + data.cost.gold + '</span></button>', function(btn) {
                var submit = form.querySelector('[type="submit"]');

                btn.onclick = function() {
                  submit.click();
                };
              });

              var select = $.parseNode('<select class="rent__select"></select>', function(select) {
                var oldSelect = form.cnt;

                select.innerHTML = oldSelect.innerHTML;
                select.onchange = formApp.change(oldSelect, btn.firstElementChild, +data.cost.gold.replace(',', ''));
                select.onwheel = formApp.wheel(select.childElementCount);
              });

              rent.appendChild(select);
              rent.appendChild(btn);
            }), center.children[3]);
          }) : null;
        })();

        return function(data) {
          that.createArt({
            data: data,
            callback: callback
          });
        };
      },
      toLocaleString: function(number) {
        number += '';

        switch (number.length) {
          case 4: number = number[0] + ',' + number.slice(1); break;
          case 5: number = number.slice(0, 2) + ',' + number.slice(2); break;
          case 6: number = number.slice(0, 3) + ',' + number.slice(3); break;
        }

        return number;
      }
    };

    var oldShop = shopSet.oldShop = (function(table) {
      var tbody = table.firstElementChild;

      var tabsData = {
        index: $.index(tbody.querySelector('.wbwhite')) % 3,
        data: $.toArray(tbody.firstElementChild.children).slice(0, -1).map(function(e) {
          e = e.firstElementChild;
          return [e.getAttribute('href'), e.textContent];
        })
      };

      var navData = (function(that) {
        that.data = $.toArray(tbody.children[1].children[1].querySelectorAll('a, b')).map(function(x, i) {
          var href = x.getAttribute('href');
          var text = x.textContent;
          if (!href) {
            href = '#';
            that.index = i;
            that.section = (text = text.slice(3));
          }
          return [href, text];
        });

        if (that.data.length === 8) that.data.push(['shop.php?cat=other', 'Другое'], ['shop.php?cat=gift', 'Подарки'], ['shop.php?cat=transport', 'Транспорт']);

        return that;
      })({});

      var arts = $.toArray(tbody.children[1].children[0].children).filter(function(node) {
        return node.tagName === 'TABLE';
      });

      var artsData = arts.map(function(art) {
        return shopSet.artInfo(art);
      });

      return {
        table: table,
        tabsData: tabsData,
        navData: navData,
        getArtsData: function() {
          return artsData;
        }
      };
    })($('table.wb[width="95%"]'));

    var newShop = shopSet.newShop = (function(table) {
      var main = table.firstElementChild;

      (function(tabs, elem) {
        tabs.data.forEach(function(data) {
          elem.innerHTML += '<a href="' + data[0] + '" class="shop__tab">' + data[1] + '</a>';
        });
        elem.children[tabs.index].className += ' selected';
      })(oldShop.tabsData, main.firstElementChild);

      var navContainer = $.parseNode('<div class="shop__nav-wrap"><div class="shop__nav-box"><div class="shop__tab">Разделы</div><div class="shop__nav"></div></div></div>', function(elem) {
        var nav = elem.querySelector('.shop__nav');
        var navData = oldShop.navData;
        var navKeys = navData.data.map(function(data) {
          var key = data[0];
          return key === '#' ? shopData.category : key.match(/cat=(\w+)/)[1];
        });

        navData.data.forEach(function(data, i) {
          var a = $.parseNode('<a href="' + data[0] + '" id="s-' + navKeys[i] + '">' + data[1] + '</a>');
          nav.appendChild(a);
        });

        nav.appendChild($.parseNode('<span id="nav-flag"></span>'));
      });

      var filter = (function(elem) {
        var output = elem.firstElementChild;
        var input = elem.lastElementChild;
        var timer;

        input.addEventListener('input', function(e) {
          var val = this.value.toLowerCase(), counter = 0;

          timer && clearTimeout(timer);

          timer = setTimeout(function() {
            arts.forEach(function(art) {
              if (!val) return ++counter, art.removeAttribute('hidden');

              var text = art.textContent.toLowerCase();

              if (text.indexOf(val) >= 0) ++counter, art.removeAttribute('hidden');
              else art.setAttribute('hidden', '');
            });

            output.textContent = val ? counter : '';
          }, 400);
        });

        return elem;
      })($.parseNode('<div class="shop__filter"><span></span><input type="text" id="shop__filter" placeholder="Фильтр..."></div>'));

      var artsBox = shopSet.artsBox = $.parseNode('<div class="shop__arts-box"></div>');
      var arts = shopSet.arts = [];

      var artsData = oldShop.getArtsData();

      if (!artsData) return;

      console.log(artsData);

      artsData.forEach(shopSet.artsDataEach(shopSet));

      main.appendChild(navContainer);
      main.appendChild(filter);
      main.appendChild(artsBox);

      return {
        table: table,
        nav: navContainer,
        filter: filter,
        arts: arts,
        draw: function() {
          table.setAttribute('data-params', shopData.toString());
          document.body.appendChild(table);
        }
      };
    })($.parseNode('<div class="shop-table"><div class="shop__main"><div class="shop__tabs"></div></div></div>'));

    newShop && newShop.draw();

    (!(+shopData.rent) && !/gift|other/.test(shopData.category)) && document.addEventListener('mouseover', function(e) {
      /* Функция подсчитывает общую цену арта (золото + ресурсы)
      и добавляет новый элемент в строку стоимости (.art__cost).
      Отображение регулируется через CSS. */

      var trg = e.target, test = /art__cost/.test(trg.className), total = 0;
      
      if (!test) return;
      
      test = trg.querySelector('.res-in-gold');

      if (test) return;

      var nodes = $.toArray(trg.children);

      if (nodes.length === 1) return;

      nodes.forEach(function(node) {
        var text = node.textContent;

        if (/gold/.test(node.className)) total += +text.replace(/,/g, '');
        else if (/wood|ore/.test(node.className)) total += text * 180;
        else total += text * 360;
      });

      trg.innerHTML += '<span class="res-in-gold">' + shopSet.toLocaleString(total); + '</span>';
    });

    document.addEventListener('click', function(e) {
      var trg = e.target, purchase;

      if (trg === trg.closest('.a-link')) {
        purchase = trg.art_purchase;

        if (frame.overflow()) return purchase && purchase[0].parentNode.removeChild(purchase[0]);

        if (!purchase) {
          purchase = trg.art_purchase = [$.parseNode('<div class="art__purchase"><span class="a-purchase">0</span></div>'), 0];
          trg.parentNode.parentNode.insertBefore(purchase[0], trg.parentNode.nextElementSibling);
        }

        frame.purchase({
          target: trg,
          purchase: purchase
        });
      }
    });

    isOverflow && frame.overflow();

    frame.fix('newShopFrame');

    location.hash.slice(5) && shopSet.arts.forEach(function(art) {
      if (art.id !== location.hash) return;

      art.className += ' art--target';
      window.scrollTo(0, art.offsetTop);
    });

    currentScript && (currentScript.id = '');
  };

  document.readyState === 'complete' ? shopRedisign() : window.addEventListener('load', shopRedisign);
})(document.getElementById('_shopRedisign'));