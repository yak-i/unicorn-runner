function createBackgroundLayer(level, tiles, image) {
    const resolver = new TileResolver(tiles);
    const buffer = document.createElement('canvas');
    const sprites = new SpriteSheet(image, 60, 60);

    sprites.define('ground', 0, 0, 60, 60);

    buffer.width = 840 + 60;
    buffer.height = 660;

    const context = buffer.getContext('2d');

    function redraw(startIndex, endIndex)  {
        context.clearRect(0, 0, buffer.width, buffer.height);

        for (let x = startIndex; x <= endIndex; ++x) {
            const col = tiles.grid[x];
            if (col) {
                col.forEach((tile, y) => {
                    sprites.drawTile('ground', context, x - startIndex, y);
                });
            }
        }
    }

    return function drawBackgroundLayer(context, camera) {
        const drawWidth = resolver.toIndex(camera.size.x);
        const drawFrom = resolver.toIndex(camera.pos.x);
        const drawTo = drawFrom + drawWidth;

        redraw(drawFrom, drawTo);

        context.drawImage(buffer,
            -camera.pos.x % 60,
            -camera.pos.y);
    };
}

function drawStaticBackground(background) {
    const buffer = document.createElement('canvas');
    buffer.width = 840 + 60;
    buffer.height = 660;

    let BackgroundImage;
    let GlassBackImage;
    let GlassFrontImage;
    let loaded = 0;
    const context = buffer.getContext('2d');

    function drawGradient(context, color) {
        let gradient = context.createLinearGradient(0, 0, 0, buffer.width);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color);
        context.fillStyle = gradient;
        context.fillRect(0, 0, buffer.width, buffer.height);
    }

    function loadBackground() {
        loadImage(background.backImage).then(function(result) {
            GlassBackImage = result;
        });
        loaded++;

        loadImage(background.backgroundImage).then(function(result) {
            BackgroundImage = result;
            loaded++;
        });

        loadImage(background.frontImage).then(function(result) {
            GlassFrontImage = result;
        });
        loaded++;

    }

    function drawBackground(context, camera) {
        let BackgroundCoordX = -camera.pos.x / 0.8;
        let GlassCoordX = -camera.pos.x / 1.2;

        for (let i = 0; i < 30; i++) {
            if (GlassBackImage) {
                context.drawImage(GlassBackImage, GlassCoordX + BackgroundImage.width * i + 600, buffer.height - GlassBackImage.height + 1);
            }
            context.drawImage(BackgroundImage, BackgroundCoordX + BackgroundImage.width * i, buffer.height - BackgroundImage.height + 1);
            if (GlassFrontImage) {
                context.drawImage(GlassFrontImage, GlassCoordX + BackgroundImage.width * i + 100, buffer.height - GlassFrontImage.height + 1);
            }
        }
    }

    loadBackground();
    return function drawBackgroundLayer(context, camera) {
        if (loaded > 2) {
            drawGradient(context, background.backgroundColor);
            drawBackground(context, camera);
        }
    }
}

function createSpriteLayer(entities, width = 172, height = 119) {
    const spriteBuffer = document.createElement('canvas');
    spriteBuffer.width = width;
    spriteBuffer.height = height;
    const spriteBufferContext = spriteBuffer.getContext('2d');

    return function drawSpriteLayer(context, camera) {
        entities.forEach(entity => {
            spriteBufferContext.clearRect(0, 0, width, height);

            entity.draw(spriteBufferContext);

            context.drawImage(
                spriteBuffer,
                entity.pos.x - camera.pos.x,
                entity.pos.y - camera.pos.y);
        });
    };
}
