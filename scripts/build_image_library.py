from pathlib import Path
import json
root=Path(__file__).resolve().parent.parent
ext={'.jpg','.jpeg','.png','.webp','.gif','.avif'}
images=[]
for f in sorted((root/'assets').rglob('*')):
    if f.is_file() and f.suffix.lower() in ext:
        rel=f.relative_to(root).as_posix()
        images.append({'path':rel,'name':f.stem.replace('-',' ').replace('_',' ').title(),'category':f.parent.name.title() if f.parent.name!='assets' else 'General'})
(root/'image-library.json').write_text(json.dumps({'images':images},indent=2)+'\n',encoding='utf-8')
print(f'Indexed {len(images)} images')
