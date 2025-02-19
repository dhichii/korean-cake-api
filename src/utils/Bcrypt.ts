import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class Bcrypt {
  constructor(private saltRound = 10) {}

  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRound);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
