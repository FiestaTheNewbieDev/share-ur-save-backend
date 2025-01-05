import { Global, Module } from '@nestjs/common';
import { FirebaseService } from 'src/services/firebase.service';

@Global()
@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
