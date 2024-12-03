---
layout: changeablepages
language: en
title: Exercises 4
lesson_number: 5
---

# Verb Conjugation

## Exercise 1
That book will be mine
<div id="exerciseContainer1"></div>

## Exercise 2
I have animals
<div id="exerciseContainer2"></div>

## Exercise 3
The animals won't have food
<div id="exerciseContainer3"></div>

## Exercise 4
She didn't drink
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
