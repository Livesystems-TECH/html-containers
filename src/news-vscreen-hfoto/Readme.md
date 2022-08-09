## News container

**For vertical screen and horizontal (landscape) photo.**  
Contains main image, title and text of some news / interesting fact / etc..

### Instructions 
1. Put background photo as `photo.jpg` in example.    
It's recommended to simply replace it, keeping the same name.   
   _(otherwise don't forget to change img 'src' attribute in `index.html` accordingly)_
2. Sponsors logo can be placed as `logo.svg`.  
3. Specify "text" and "title" in `content.json`
4. Specify "animation" in `context.json`.   
Possible values: "none", "move-to-left", "move-to-right", "zoom".    
5. Customize "bgColor" and "duration" if needed.    
Background color should be a HEX string like `'#aabbcc'`.   
Duration should be integer or float number - amount of seconds

### Performance / appearance details
- Picture ratio is 9x16 (1080 x 1920 on fullHd). If it's wider extra space will be cropped.   
  (equally from left and right side)
- When use left/right slide animations - provide an image with a little extra space on sides. (5-10% padding on each side is enough)
- Zoom animation is less performant, may cause visible fps drop 