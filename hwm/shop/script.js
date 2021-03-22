(function(script) {
  'use strict';
  var $ = (function() {function fn(s) {return document.querySelector(s);}function extend(target, source) {for (var key in source) {target[key] = source[key];} return target;}return extend(fn, {toArray: function(a) {var res = [], i = 0; for (; i < a.length; res.push(a[i++])); return res;},parseNode: function(html, callback) {var div = document.createElement('div'); div.innerHTML = html; div = div.firstChild.cloneNode(!0); callback && callback(div); return div;},index: function(e) {return fn.toArray(e.parentNode.children).indexOf(e);},rnd: function(n) {return Math.random() * n >> 0;},extend: extend});})();

  function shopRedesign() {
    var locked;
    var shopContainer = $.parseNode('<div class="shopContainer"></div>', function(elem) {
      document.body.appendChild(elem);
    });

    var mobile = (function(test) {
      if (!test) return !1;

      var w = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
      var el = document.body.firstElementChild;

      function removeStyle(e) {
        return e && e.removeAttribute('style');
      }

      document.body.setAttribute('data-mobile', '');
      w.onresize = w.onorientationchange = null;
      removeStyle(document.body);

      while (el) {
        if (el.id === 'android_main') {
          [el, el.firstElementChild].forEach(removeStyle);
          break;
        }
        $.toArray(el.getElementsByTagName('*')).concat(el).forEach(removeStyle);
        el = el.nextElementSibling;
      }

      return !0;
    })(document.getElementById('link_home'));

    var resources = (function(target, that) {
      if (!target) return null;

      var keys = 'gold|wood|ore|mercury|sulfur|crystals|gems|diamonds'.split('|');
      var res = $.toArray(target.querySelectorAll('span, td:nth-child(2n), .panel_res'));
      var values = res.map(function(el) {
        return +el.textContent.replace(/,/g, '');
      });

      keys.forEach(function(key, ind) {
        var elem = res[ind];

        that[key] = {
          key: key,
          value: values[ind],
          decrement: function(n) {
            elem.textContent = shopSet.toLocaleString(this.value -= n);
          }
        };
      });

      return that;
    })($('#ResourcesPanel, #top_res_table, #panel_resourses'), {});

    var heroLevel = ($('.wb font[color="red"] > b') || $.parseNode('<div>23</div>')).textContent - 1;

    var shopData = (function(l) {
      var search = l.search;
      return {
        cat: (search.match(/cat=(\w+)/) || [, 'weapon'])[1],
        rent: (search.match(/rent=(\d)/) || '')[1] >> 0,
        toString: function() {
          return search;
        }
      };
    })(location);

    var frame = (function(elem) {
      document.body.appendChild(elem);

      var name = elem.name || 'shopFrame';
      var w = elem.contentWindow;
      var references = [], purchaseData;
      var that = {
        onload: function() {
          if (!(locked && purchaseData)) return;
          that.purchaseSuccess(purchaseData);
        },
        purchaseProcess: function(data) {
          locked = 1;
          purchaseData = data;
          newShop.setState('locked');
          data.purchase.target.className += ' art__purchase--loading';
          data.artInfo.submitForm && data.artInfo.submitForm();
        },
        purchaseSuccess: function(data) {
          locked = 0;
          newShop.setState('');
          data.purchase.target.className = 'art__purchase';
          data.purchase.increment();
          data.callback && data.callback(w.document.body);
          data.resources.forEach(function(res) {
            resources[res.key].decrement(res.value);
          });
        },
        overflow: function(data) {
          var body = w.document.body;

          if (shopData.cat === 'other' || (data && /el_bottle|ng_el_b/.test(data.id))) return;
          if (body && body.querySelector('td > b > font[color="red"]')) {
            newShop.setState('locked');
            shopAlert.setContent('<a href="/inventory.php" class="td-u">Инвентарь</a> переполнен!').show();
            return (locked = 1);
          }
        },
        fix: function(newName) {
          var oldName = name;

          w.name = elem.name = name = newName;

          references.forEach(function(e) {
            return e.target = newName;
          });
        },
        add: function(e) {
          references.push(e);
        }
      };

      elem.onload = that.onload;

      return that;
    })($.parseNode('<iframe src="' + location.href + '" class="shopFrame" name="shopFrame"></iframe>'));

    var shopAlert = (function(elem) {
      var box = elem.querySelector('.shopAlert__content');
      var btn = box.nextElementSibling;
      var that = {
        target: elem,
        show: function() {
          elem.className += ' shopAlert--shown';
          return this;
        },
        hide: function() {
          elem.className = 'shopAlert';
          return this;
        },
        setContent: function(html) {
          box.innerHTML = html;
          return this;
        }
      };

      elem.addEventListener('click', function(e) {
        var trg = e.target;

        if (trg === elem || trg.closest('.shopAlert__btn')) that.hide();
      });

      document.addEventListener('keydown', function(e) {
        if (e.keyCode === 27) that.hide();
      });

      return that;
    })($.parseNode('<div class="shopAlert"><div class="shopAlert__inner"><div class="shopAlert__content"></div><div class="shopAlert__btn">OK</div></div></div>'));

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
    })(shopData.cat);

    var isOverflow = shopData.cat !== 'other' && $('td > b > font[color="red"]');

    var shopSet = {
      propsMap: {
        'стоимость': 'cost',
        'требуемый уровень': 'level',
        'прочность': 'durability',
        'очки амуниции': 'OA',
        'доступно для продажи': 'availableForSail'
      },
      auc: function(id) {
        return 'auction.php?cat=' + shopData.cat + '&sort=4&art_type=' + id;
      },
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
              frame.add(link);
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
            frame.add(link);
          }

          link.innerHTML = !el.querySelector('img') ? text : text + ' <span class="res res--diamonds"></span>';

          return link;
        });
      })(shopData.cat),
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

        if (shopData.rent === 2) {
          that.name = that.name.match(/[^\[]+/)[0].trim();

          that.craftData = $.toArray(imgParent.children).slice(2).map(function(img) {
            return [(img.src.match(/(\w\d+)\.gif/) || '')[1], img.title];
          });
        }

        props.forEach(function(prop, ind) {
          return this.getProps(that, prop, ind, lastProp);
        }, this);

        otherData[id] && $.extend(that, otherData[id]);

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

            !/gift|other/.test(shopData.cat) && box.appendChild($.parseNode('<a href="' + shopSet.auc(data.id) + '">Рынок</a>'));
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
          if (elem.tagName === 'FONT' && otherData[that.id]) otherData[that.id].boosterAlert = $.parseNode('<div class="boosterAlert">' + elem.innerHTML + '</div>');

          elem = elem.parentNode.querySelector('button:last-of-type');

          return elem ? [this.createLink(elem)] : [];
        });
      })(shopData.cat),
      getProps: function(that, prop, ind, last) {
        if (!ind && shopData.rent && prop.tagName === 'TABLE') {
          var img = prop.querySelector('img');
          var formCont = document.getElementById(that.id);

          if (img) that.cost = {gold: img.parentNode.nextElementSibling.textContent.trim()};
          if (formCont && !isOverflow) {
            formCont.querySelector('a').click();
            that.form = formCont.firstElementChild || document.forms['f' + that.id];
          }

          return;
        }

        var text = prop.textContent.trim().toLowerCase().replace(/:$/, '');

        switch (text) {
          case 'стоимость':
            !that.cost && (that.cost = this.getMods(prop, /\/(\w+)\.png/));
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
            if (shopData.cat === 'other') break;
            that.descr = (function(node, descr) {
              while (node = node.nextSibling) {
                if (node.nodeType === 3) descr += node.nodeValue.trim();
              }
              return descr;
            })(prop.nextSibling, '');
            break;
          case 'модификаторы':
            that.primaryMods = this.getMods(prop, /attr_(\w+)/);
            that.secondaryMods = (function(node, list) {
              var tag;
              while (node = node.nextElementSibling) {
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
        })(shopData.rent);

        var callback = (function() {
          return shopData.cat === 'other' ? (function(art, data) {
            var center = art.children[1];

            if (data.boosterAlert) {
              var descr = center.querySelector('.art__descr');
              descr && descr.appendChild(data.boosterAlert);
            }
            if (data.propsExtend) {
              var propsElem = center.querySelector('.art__properties');
              propsElem && data.propsExtend(propsElem);
            }
          }) : formApp && (function(art, data) {
            var center = art.children[1];

            data.form && center.insertBefore($.parseNode('<div class="art__rent"><span class="art__prop">Аренда на (кол-во боев):</span></div>', function(rent) {
              var form = data.form;

              var btn = $.parseNode('<button class="a-link art__btn">Аренда: <span class="res res--gold">' + data.cost.gold + '</span></button>', function(btn) {
                var submit = form.querySelector('[type="submit"]');

                data.submitForm = function() {
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
              form.target = frame.name;
              frame.add(form);
            }), center.children[3]);
          });
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
        data: $.toArray(tbody.firstElementChild.children).slice(0, 3).map(function(e) {
          e = e.firstElementChild;
          return [e.getAttribute('href'), e.textContent];
        })
      };

      var navData = (function(that) {
        that.data = $.toArray(tbody.children[1].children[1].querySelectorAll('a, b')).map(function(x, i) {
          var href = x.getAttribute('href'), text = x.textContent;

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

      table.className += ' oldShop';
      shopContainer.appendChild(table);

      return {
        table: table,
        tabsData: tabsData,
        navData: navData,
        getArtsData: function() {
          return artsData;
        }
      };
    })($('table.wb[cellpadding="10"]'));

    var newShop = shopSet.newShop = (function(target) {
      var main = target.firstElementChild;

      (function(tabs, elem) {
        var test = /gift|other/.test(shopData.cat);

        tabs.data.forEach(function(data, i) {
          var href = !(i && test) ? data[0] : data[0].replace(/cat=\w+/, 'cat=weapon');
          var tab = $.parseNode('<a href="' + href + '" class="shop__tab">' + data[1] + '</a>');

          elem.appendChild(tab);
        });
      })(oldShop.tabsData, main.firstElementChild);

      var navContainer = $.parseNode('<div class="shop__nav-wrap"><div class="shop__nav-box"><div class="shop__tab">Разделы</div><div class="shop__nav"></div></div></div>', function(elem) {
        var nav = elem.querySelector('.shop__nav');
        var navData = oldShop.navData.data;
        var navKeys = navData.map(function(data) {
          var key = data[0];
          return key === '#' ? shopData.cat : key.match(/cat=(\w+)/)[1];
        });

        navData.forEach(function(data, i) {
          var a = $.parseNode('<a href="' + data[0] + '" id="s-' + navKeys[i] + '">' + data[1] + '</a>');
          nav.appendChild(a);
        });

        nav.appendChild($.parseNode('<span id="nav-flag"></span>'));
        elem.appendChild($.parseNode('<div id="toTop"><a href="#" tabindex="-1"></a></div>', function(el) {
          el.firstElementChild.addEventListener('click', function(e) {
            e.preventDefault();
            window.scroll({top: 0, behavior: 'smooth'});
          });
        }));
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
              if (!val) return ++counter && art.removeAttribute('hidden');

              var text = art.textContent.toLowerCase();

              if (text.indexOf(val) >= 0) ++counter && art.removeAttribute('hidden');
              else art.setAttribute('hidden', '');
            });

            output.textContent = val ? counter : '';
          }, 400);
        });

        return elem;
      })($.parseNode('<div class="shop__filter"><span></span><input type="text" id="shop__filter" placeholder="Фильтр..."></div>'));

      var artsBox = $.parseNode('<div class="shop__arts-box"></div>');
      var arts = shopSet.arts = [];
      var artsData = oldShop.getArtsData();

      console.log(artsData);

      artsData.forEach(shopSet.artsDataEach(shopSet));
      arts.forEach(function(art) {
        artsBox.appendChild(art);
      });

      main.appendChild(navContainer);
      main.appendChild(filter);
      main.appendChild(artsBox);

      return {
        target: target,
        arts: arts,
        draw: function() {
          target.setAttribute('data-params', shopData.toString());
          shopContainer.appendChild(target);
          setTimeout(function() {
            shopContainer.className += ' shop--loaded';
          }, 20);
        },
        setState: function(value) {
          target.setAttribute('data-state', value);
        }
      };
    })($.parseNode('<div class="newShop"><div class="shop__main"><div class="shop__tabs"></div></div></div>'));

    newShop.draw();
    newShop.target.appendChild(shopAlert.target);

    !shopData.rent && !/gift|other/.test(shopData.cat) && document.addEventListener('mouseover', function(e) {
      /* Функция подсчитывает общую цену арта (золото + ресурсы)
      и добавляет новый элемент в строку стоимости (.art__cost).
      Отображение регулируется через CSS. */

      var trg = e.target;
      var test = !trg._resInGold && trg.childElementCount > 1 && /art__cost/.test(trg.className);
      var total = 0;

      if (!test) return;

      $.toArray(trg.children).forEach(function(node) {
        var text = node.textContent;

        if (/gold/.test(node.className)) total += +text.replace(/,/g, '');
        else if (/wood|ore/.test(node.className)) total += text * 180;
        else total += text * 360;
      });

      trg._resInGold = 1;
      trg.innerHTML += '<span class="res-in-gold">' + shopSet.toLocaleString(total); + '</span>';
    });

    document.addEventListener('click', function(e) {
      var trg = e.target;

      if (trg === trg.closest('.a-link')) {
        if (locked || trg.getAttribute('href') === '#') {
          e.preventDefault();
          return !1;
        }

        var art = trg.closest('[id^="art-"]');
        var artInfo = oldShop.getArtsData()[newShop.arts.indexOf(art)];

        if (frame.overflow(artInfo)) {
          e.preventDefault();
          return !1;
        }

        var diamonds = trg.querySelector('.res--diamonds');

        var res = (function(cost) {
          if (diamonds) {
            var value = +trg.textContent.match(/\d+/)[0];
            var test = resources.diamonds.value - value >= 0;
            return [test && {key: 'diamonds', value: value}];
          }
          return Object.keys(cost).map(function(k) {
            var r = resources[k].value;
            var v = +cost[k].replace(/,/, '');
            var test = r - v >= 0;

            return test && {key: k, value: v};
          });
        })(artInfo.cost);

        if (!res.every(Boolean)) {
          e.preventDefault();
          trg.setAttribute('tabindex', '-1');
          trg.setAttribute('disabled', '');
          trg.setAttribute('href', '#');

          if (diamonds) shopAlert.setContent('Недостаточно <a href="/hwm_donate_page_new.php" class="td-u">бриллиантов!</a> <span class="res res--diamonds"></span>').show();
          else shopAlert.setContent('Недостаточно ресурсов!').show();

          return !1;
        }

        var callback;

        if (shopData.rent) res[0].value *= trg.previousElementSibling.value;
        else if (shopData.cat === 'other' && /booster/.test(artInfo.id)) {
          callback = function(d) {
            var font = d.querySelector('#' + artInfo.id + ' ~ font');

            if (font) {
              if (artInfo.boosterAlert) artInfo.boosterAlert.innerHTML = font.innerHTML;
              else art.querySelector('.art__descr').appendChild($.parseNode('<div class="boosterAlert">' + font.innerHTML + '</div>'));
            }

            trg.setAttribute('tabindex', '-1');
            trg.setAttribute('disabled', '');
            trg.setAttribute('href', '#');
          };
        }

        var purchase = artInfo.purchase || (function(target, counter) {
          trg.parentNode.parentNode.insertBefore(target, trg.parentNode.nextElementSibling);

          return (artInfo.purchase = {
            target: target,
            output: target.firstElementChild,
            increment: function() {
              this.output.textContent = ++counter;
            }
          });
        })($.parseNode('<div class="art__purchase"><span class="a-purchase">0</span></div>'), 0);

        frame.purchaseProcess({
          target: trg,
          purchase: purchase,
          artInfo: artInfo,
          resources: res,
          callback: callback
        });
      }
    });

    frame.fix('newShopFrame');

    var hash = location.hash.slice(1);

    hash.slice(4) && shopSet.arts.forEach(function(art) {
      if (art.id !== hash) return;

      art.className += ' art--target';
      window.scrollTo(0, art.offsetTop);
    });

    if (isOverflow) {
      newShop.setState('locked');
      setTimeout(function() {
        shopAlert.setContent('<a href="/inventory.php" class="td-u">Инвентарь</a> переполнен!').show();
      }, 500);
    }

    script && (script.id = '');
  }

  document.readyState === 'complete' ? shopRedesign() : window.addEventListener('load', shopRedesign);
})(document.currentScript || document.getElementById('_shopRedesign'));
