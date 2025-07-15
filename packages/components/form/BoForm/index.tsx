import {
  createContext,
  PropsWithChildren,
  useContext,
  useRef,
  useState,
} from "react";
import {
  useForm,
  UseFormReturn,
  useWatch as rhfUseWatch,
} from "react-hook-form";

type FormProps = {
  formRef?: React.MutableRefObject<FormApis | undefined>;
  onSubmit: (data: any) => Promise<boolean>;
};

type Origin = ReturnType<typeof useForm>;

export type FormApis = {
  // 把原始的api暴露出来
  getFieldState: Origin["getFieldState"];
  reset: Origin["reset"];
};

type RHFContextType = {
  origin: Origin | undefined;
  state: {
    loading: boolean;
  };
};

export const RHFContext = createContext<RHFContextType>({
  origin: undefined,
  state: {
    loading: false,
  },
});

export default function BoForm({
  children,
  onSubmit,
  formRef,
  ...props
}: PropsWithChildren<FormProps & React.HtmlHTMLAttributes<HTMLFormElement>>) {
  // loading 状态
  const [loading, setLoading] = useState(false);

  // 原始api
  const originForm = useForm();

  const value = {
    origin: originForm,
    state: {
      loading,
    },
  };

  if (formRef && "current" in formRef) {
    formRef.current = getFormApi(value);
  }

  // 表单错误
  const errors = originForm.formState.errors;

  async function _onSubmit(data) {
    setLoading(true);

    // 校验
    if (Object.keys(errors).length > 0) {
      return Promise.reject(errors);
    }

    try {
      // 回调 外面处理提交
      await onSubmit(data);
      console.log("成功");
    } catch (e) {
      console.log("失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <RHFContext.Provider value={value}>
      <form {...props} onSubmit={originForm.handleSubmit(_onSubmit)}>
        {children}
      </form>
    </RHFContext.Provider>
  );
}

function getFormApi({ origin }: RHFContextType) {
  return {
    getFieldState: origin!.getFieldState,
    reset: origin!.reset,
  };
}

/**
 * 方便使用的 formApi
 */
export function useFormApi(): FormApis {
  return getFormApi(useContext(RHFContext));
}

/**
 * watch context form 的一个 name 的值
 */
export function useWatch(name: string) {
  const { origin } = useContext(RHFContext);

  const fieldValue = rhfUseWatch({
    control: origin?.control,
    name: name,
  });

  return fieldValue;
}
