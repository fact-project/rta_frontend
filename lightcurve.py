from rta_model import Signal, FactRun
from fact import analysis, instrument
from fact import  plotting
import pandas as pd
import matplotlib.pyplot as plt
import click
import dateutil.parser

theta_off_keys = ['theta_off_{}'.format(i) for i in range(1, 6)]

def fetch_data(start, end, source=None):

    print('Start: {}'.format(start))
    print('End: {}'.format(end))
    print('Source: {}'.format(source))

    query = FactRun.select() \
                    .where(FactRun.health == 'OK')\
                    .where(FactRun.start_time >= start & FactRun.end_time <= end)

    if source:
        query = query.where(FactRun.source == source)

    runs = pd.DataFrame(list(query.dicts()))

    query = Signal.select().where(Signal.event_timestamp >= start & Signal.analysis_timestamp <= end)
    events = pd.DataFrame(list(query.dicts()))

    if len(runs) == 0:
        return runs, events

    # rename columns to fit the expected column names for pyfact stuff
    runs = runs.rename(columns={'on_time':'ontime', 'run':'run_id', 'start_time':'run_start', 'end_time':'run_stop'})
    events = events.rename(columns={'run':'run_id'})

    # for some reason the dates will get parsed as strings by peewee.
    # so I create a pandas datime thing by hand
    runs['run_start'] = pd.to_datetime(runs['run_start'])
    runs['run_stop'] = pd.to_datetime(runs['run_stop'])

    # provide theta in the right unit and name
    # use pyfact to get from mm in camera coordinates to degree.

    for t in ['theta_on'] + theta_off_keys:
        events[t] = events[t].apply(instrument.camera_distance_mm_to_deg)

    return runs, events

def excess(runs, events, prediction_threshold=0.9, theta2_cut=0.02, bin_width_minutes=20):
    s = analysis.calc_run_summary_source_independent(
        events,
        runs,
        prediction_threshold=prediction_threshold,
        theta2_cut=theta2_cut,
        prediction_key='prediction',
        theta_key='theta_on',
        theta_off_keys=theta_off_keys
    )

    def f(df):
        return analysis.ontime_binning(df, bin_width_minutes=bin_width_minutes)

    d = analysis.bin_runs(s, binning_function=f)

    return d

def main():

    start = dateutil.parser.parse('2013-11-03')
    end = dateutil.parser.parse('2013-11-04')

    events, runs = fetch_data(start, end)
    d = excess(runs, events)
    import IPython; IPython.embed()

    # plotting.analysis.plot_excess_rate(d)
    # plt.show()


if __name__ == '__main__':
    main()
