import type { ImageSourcePropType } from 'react-native';

export const GLASSES_FRAME_IMAGE_SOURCES: Record<string, ImageSourcePropType> = {
  Авиаторы: require('../Оправы/Авиаторы.jpg'),
  Овальные: require('../Оправы/Овальные.webp'),
  'Кошачий глаз': require('../Оправы/Кошачий глаз.webp'),
  Круглые: require('../Оправы/Круглые.webp'),
  Геометрические: require('../Оправы/Геометрические.png'),
  Прямоугольные: require('../Оправы/Прямоугольные.jpeg'),
  Квадратные: require('../Оправы/Квадратные.jpg'),
  Вайфареры: require('../Оправы/Вайфареры.jpg'),
};

export const GLASSES_FRAME_NAMES = Object.keys(GLASSES_FRAME_IMAGE_SOURCES);

export function getGlassesFrameImage(name: string): ImageSourcePropType | undefined {
  return GLASSES_FRAME_IMAGE_SOURCES[name.trim()];
}
