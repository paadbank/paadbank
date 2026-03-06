
export interface BackendTestData {
  test: string;
}

export class TestData {
  test: string;

  constructor(data?: BackendTestData | null) {
    this.test = data?.test ?? "";
  }

  copyWith(data: Partial<TestData>): TestData {
    const backendLike: BackendTestData = {
      test: data.test ?? this.test,
    };

    return new TestData(backendLike);
  }

  static from(data: any): TestData {
      if (data instanceof TestData) return data;

      // Frontend style (camelCase)
      return new TestData({
        test: data.test,
      });
  }

  toBackend(): BackendTestData {
    return {
      test: this.test,
    };
  }
}