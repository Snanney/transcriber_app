# React + TypeScript + Vite

This is a transcriber_app I made to familiarize myself with this type of stack
after noticing it was quite common amoung jobs I wanted to apply for.

Status: IN PROGRESS

Completed:
Clean Commit of base line to github

Milestone 1: file picker
  - componet that allows you to select a file from you computer
  - should be able to see file size, type, and name
  - if file isn't .mp3, .mp4, or .wav an error is shown

In Progress:

Milestone 2: Audio files into raw audio samples
  - The Whisper model can't read an mp3 or mp4 so we need the audio
  it will transcribe from to be a plain list of numbers describing
  the sound wave.


What I learned:
  TypeScript:
    - TypeScript is JavaScript with labels
    - div helps you send multiple html tags together

  React:
    - React has components that are a function, this returns what should
    be on screen

    useState:
      - a hook, a built-in React function
        - All hooks must be called in at the top of level of a component (FilePicker.tsx is a component)


  Why component function instead of normal variable?
    - React re-runs your component function every time it needs to update the screen.
    - Changing a normal variable doesn't tell React anything changed.