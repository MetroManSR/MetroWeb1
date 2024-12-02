---
layout: default
language: en
title: Units Menu
---

# Units Menu

<ul id="id01">
  {% for unit in site.pages %}
    {% if unit.path contains 'balkeon/letslearn' and unit.path contains 'index' and unit.path != page.path and unit.language == 'en' %}
      <li><a href="{{ unit.url }}">{{ unit.title}}</a></li>
    {% endif %}
  {% endfor %}
</ul>

<script>
function sortList() {
  var list, i, switching, b, shouldSwitch;
  list = document.getElementById("id01");
  switching = true;
  /* Make a loop that will continue until
  no switching has been done: */
  while (switching) {
    // Start by saying: no switching is done:
    switching = false;
    b = list.getElementsByTagName("LI");
    // Loop through all list items:
    for (i = 0; i < (b.length - 1); i++) {
      // Start by saying there should be no switching:
      shouldSwitch = false;
      /* Check if the next item should
      switch place with the current item: */
      if (b[i].innerHTML.toLowerCase() > b[i + 1].innerHTML.toLowerCase()) {
        /* If next item is alphabetically lower than current item,
        mark as a switch and break the loop: */
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      /* If a switch has been marked, make the switch
      and mark the switch as done: */
      b[i].parentNode.insertBefore(b[i + 1], b[i]);
      switching = true;
    }
  }
}

document.addEventListener('DOMContentLoaded', function() { sortList(); });
</script>
