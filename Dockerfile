FROM python:3.6
RUN apt-get update && apt-get install -y git libffi-dev libssl-dev
RUN pip install --upgrade pip
RUN pip install supervisor
WORKDIR /usr/src
COPY requirements.txt /usr/src/
RUN pip install -r requirements.txt
COPY . /usr/src/
RUN python setup.py install &&\
    mkdir -p /var/log/supervisord
ENTRYPOINT ["./entrypoint.sh"]
