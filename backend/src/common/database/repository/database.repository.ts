import { PrismaService } from '../prisma.service';

type PrismaModelName =
  | 'user'
  | 'trainerProfile'
  | 'workout'
  | 'exercise'
  | 'progress';

export abstract class DatabaseRepository<T> {
  protected abstract readonly modelName: PrismaModelName;

  constructor(protected readonly prisma: PrismaService) {}

  protected findOneBy(field: string, value: unknown): Promise<T | null> {
    // PrismaClient has strongly-typed model properties; we access dynamically by name here.
    const model = (this.prisma as unknown as Record<string, unknown>)[
      this.modelName
    ] as {
      findFirst?: (args: { where: Record<string, unknown> }) => Promise<T | null>;
    };

    if (!model?.findFirst) {
      return Promise.resolve(null);
    }

    return model.findFirst({
      where: {
        [field]: value,
      },
    });
  }
}
