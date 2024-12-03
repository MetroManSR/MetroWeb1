---
layout: changeablepages
language: es
title: Ejercicios 4
lesson_number: 4
---

# Conjuga los Verbos

## Ejercicio 1
Ese libro será mío
<div id="exerciseContainer1"></div>

## Ejercicio 2
Tengo animales
<div id="exerciseContainer2"></div>

## Ejercicio 3
Los animales no tendrán comida
<div id="exerciseContainer3"></div>

## Ejercicio 4
Ella no bebía
<div id="exerciseContainer4"></div>

<script src="exercise.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM fully loaded and parsed');
        const language = '{{ page.language }}'; // Get the language from the front matter

        // Exercise 1
        generateExercise(
            'exerciseContainer1',
            'Atsel bukeon s __ ayeos',
            ['ib', 'ir', 'ip'],
            'ib',
            language
        );

        // Exercise 2 (Example for another sentence)
        generateExercise(
            'exerciseContainer2',
            'Aye hab__ animalseon',
            ['ib', 'ir', 'ip'],
            'ir',
            language
        );

        generateExercise(
            'exerciseContainer3',
            'Animalseon hab__ namnemeon nek',
            ['ib', 'ir', 'ip'],
            'ib',
            language
        );

        generateExercise(
            'exerciseContainer4',
            'A beab__ nek',
            ['ib', 'ir', 'ip'],
            'ip',
            language
        );
    });
</script>
