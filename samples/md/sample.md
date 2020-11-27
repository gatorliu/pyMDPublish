---
title: Colorizing Your Terminal 
tags: ForFelicity
slideOptions:        # 簡報相關的設定
  #theme: moon   # 顏色主題
  transition: 'convex' # 換頁動畫 'convex, concave, fade(default for background), slide(default for slide) , zoom none 
  backgroundTransition: 'concave'
  parallaxBackgroundImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Shadow_Hand_Bulb_large_Alpha.png/350px-Shadow_Hand_Bulb_large_Alpha.png'
---
# Simple Test MD

## Heading 2
### Heading 3

* item
* item2



1. item1
2. item2



Code:


``` python
@requires_authorization(roles=["ADMIN"])
def somefunc(param1='', param2=0):
    r'''A docstring'''
    if param1 > param2: # interesting
        print 'Gre\'ater'
    return (param2 - param1 + 1 + 0b10l) or None

class SomeClass:
    pass

>>> message = '''interpreter
... prompt'''
```


Enable typographer option to see result. (Not Working on Marked.js)
(c) (C) (r) (R) (tm) (TM) (p) (P) +-


Table

| index | item |
| -- | :--- |
| 1 | item 1 |

Link :  [Open math.md](math.md "title")

Link :  [google](http://www.google.com)

Link :  [Show Image](imgs/me.png "image")

PIC : ![Me](imgs/me.png)

