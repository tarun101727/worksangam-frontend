export default function getCroppedImg(image, crop) {

return new Promise((resolve) => {

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

canvas.width = crop.width;
canvas.height = crop.height;

ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

ctx.drawImage(
image,
crop.x,
crop.y,
crop.width,
crop.height,
0,
0,
crop.width,
crop.height
);

canvas.toBlob((blob)=>{
resolve(blob);
},"image/jpeg",0.95);

});

}