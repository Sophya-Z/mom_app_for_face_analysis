import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from 'react-native';

export type ViewfinderRect = {
  width: number;
  height: number;
};

function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error),
    );
  });
}

/** Crop like resizeMode "cover" for the visible viewfinder rectangle. */
export function computeCoverCrop(
  imageWidth: number,
  imageHeight: number,
  viewWidth: number,
  viewHeight: number,
): { originX: number; originY: number; width: number; height: number } {
  const viewAspect = viewWidth / viewHeight;
  const imageAspect = imageWidth / imageHeight;

  if (imageAspect > viewAspect) {
    const height = imageHeight;
    const width = Math.round(imageHeight * viewAspect);
    return {
      originX: Math.round((imageWidth - width) / 2),
      originY: 0,
      width,
      height,
    };
  }

  const width = imageWidth;
  const height = Math.round(imageWidth / viewAspect);
  return {
    originX: 0,
    originY: Math.round((imageHeight - height) / 2),
    width,
    height,
  };
}

export async function cropImageToViewfinder(
  imageUri: string,
  viewfinder: ViewfinderRect,
): Promise<string> {
  if (viewfinder.width <= 0 || viewfinder.height <= 0) {
    return imageUri;
  }

  const { width: imgW, height: imgH } = await getImageSize(imageUri);
  const crop = computeCoverCrop(imgW, imgH, viewfinder.width, viewfinder.height);

  const result = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ crop: crop }],
    { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG },
  );

  return result.uri;
}
