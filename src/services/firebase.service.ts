import { Injectable, Logger } from '@nestjs/common';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from 'src/configs/firebase.config';

@Injectable()
export class FirebaseService {
  private logger = new Logger(FirebaseService.name);

  constructor() {}

  async uploadFile(path: string, file: Express.Multer.File): Promise<string> {
    const storageRef = ref(storage, path);

    try {
      const snapshot = await uploadBytes(storageRef, file.buffer);

      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      this.logger.error(error);
      return Promise.reject(error);
    }
  }
}
