# -*- coding=UTF-8 -*-
# @Project          QL_TimingScript
# @fileName         get_env.py
# @author           Echo
# @EditTime         2024/11/26
import os
import re

from dotenv import load_dotenv, find_dotenv


from typing import *

all_print_list = []

def get_env(env_var, separator):
    if env_var in os.environ:
        return re.split(separator, os.environ.get(env_var))
    else:
        load_dotenv(find_dotenv())
        if env_var in os.environ:
            return re.split(separator, os.environ.get(env_var))
        else:
            fn_print(f"未找到{env_var}变量.")
            return []
def fn_print(*args, sep=' ', end='\n', **kwargs):
    global all_print_list
    output = ""
    # 构建输出字符串
    for index, arg in enumerate(args):
        if index == len(args) - 1:
            output += str(arg)
            continue
        output += str(arg) + sep
    output = output + end
    all_print_list.append(output)
    # 调用内置的 print 函数打印字符串
    print(*args, sep=sep, end=end, **kwargs)
