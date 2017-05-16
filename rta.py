from flask import Flask
from flask import render_template, Response
from flask_restful import Api, Resource, reqparse
from  datetime import datetime
import lightcurve
import dateutil.parser

app = Flask(__name__)
api = Api(app)

@api.representation('application/json')
def output_json(data, code, headers=None):
    pass

class Excess(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument('bin_width', type=int, help='bin width in minutes')
    parser.add_argument('source', type=str, help='name of the source')
    parser.add_argument('start_date', type=datetime.strptime, help='earliest observation')
    parser.add_argument('latest_date', type=datetime.strptime, help='latest observation')

    def get(self):
        args = self.parser.parse_args()
        start_date = args['start_date'] if args['start_date'] else dateutil.parser.parse('2013-01-01')
        start_date = start_date.isoformat()

        latest_date = args['latest_date'] if args['latest_date'] else datetime.now()
        latest_date = latest_date.isoformat()

        bin_width = args['bin_width'] if args['bin_width'] else 20
        source = args['source'] if args['source'] else 'Crab'

        runs, events = lightcurve.fetch_data(start=start_date, end=latest_date, source='Crab')
        if len(runs) == 0:
            return
        excess = lightcurve.excess(runs, events, bin_width_minutes=bin_width)
        resp = self.make_response(excess)
        return resp

    def make_response(self, excess):
        excess = excess.drop(['run_start', 'run_stop', 'night'], axis=1)
        excess['bin_start'] = excess.time_mean - excess.time_width * 0.5
        excess['bin_end'] = excess.time_mean + excess.time_width * 0.5
        excess = excess.drop(['time_mean', 'time_width'], axis=1)
        resp = Response(
                        response=excess.to_json(orient='records', date_format='iso'),
                        status=200,
                        mimetype="application/json"
                        )
        return resp


api.add_resource(Excess, '/excess/')

@app.route('/')
def hello():
    title='FACT Real Time Analysis'
    return render_template('index.html', title=title)
