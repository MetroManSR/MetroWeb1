---
layout: default
language: en
title: Units Menu
---

# Units Menu

<ul>
  {% for unit in site.pages %}
    {% if unit.path contains 'balkeon/letslearn' and unit.path contains 'index' and unit.path != page.path and unit.language == 'en' %}
      <li><a href="{{ unit.url }}">{{ unit.title}}</a></li>
    {% endif %}
  {% endfor %}
</ul>
